const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamsapp';
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    console.log('Creating backup directory at:', BACKUP_DIR);
    await mkdir(BACKUP_DIR, { recursive: true });
    console.log('Backup directory created successfully');
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating backup directory:', error);
      throw error;
    } else {
      console.log('Backup directory already exists');
    }
  }
}

// Save collection to file
async function saveCollection(collection, collectionName) {
  console.log(`Starting backup for collection: ${collectionName}`);
  const data = await collection.find({}).toArray();
  console.log(`Found ${data.length} documents in collection ${collectionName}`);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${collectionName}_${timestamp}.json`;
  const filePath = path.join(BACKUP_DIR, fileName);
  
  console.log(`Writing backup to file: ${filePath}`);
  await writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`Successfully saved ${collectionName} to ${fileName}`);
  return fileName;
}

// Restore collection from file
async function restoreCollection(collection, data) {
  if (data.length === 0) {
    console.log('No data to restore');
    return;
  }

  // Clear existing data
  await collection.deleteMany({});
  
  // Insert new data
  await collection.insertMany(data);
  console.log(`Restored ${data.length} documents`);
}

// Main backup function
async function backup(collectionName = null) {
  console.log('Starting backup process...');
  console.log('MongoDB URI:', MONGODB_URI);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    await ensureBackupDir();
    
    if (collectionName) {
      // Backup specific collection
      console.log(`Backing up specific collection: ${collectionName}`);
      const collection = db.collection(collectionName);
      await saveCollection(collection, collectionName);
    } else {
      // Backup all collections
      console.log('Backing up all collections...');
      const collections = await db.listCollections().toArray();
      console.log(`Found ${collections.length} collections to backup`);
      
      for (const { name } of collections) {
        const collection = db.collection(name);
        await saveCollection(collection, name);
      }
    }
    
    console.log('Backup completed successfully');
  } catch (error) {
    console.error('Backup failed with error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Main restore function
async function restore(collectionName = null) {
  console.log('Starting restore process...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    if (collectionName) {
      // Restore specific collection
      const files = await readdir(BACKUP_DIR);
      const collectionFiles = files.filter(file => 
        file.startsWith(collectionName) && file.endsWith('.json')
      );
      
      if (collectionFiles.length === 0) {
        console.error(`No backup files found for collection: ${collectionName}`);
        return;
      }
      
      // Get the most recent backup file
      const latestFile = collectionFiles.sort().pop();
      const filePath = path.join(BACKUP_DIR, latestFile);
      const data = JSON.parse(await readFile(filePath, 'utf8'));
      
      const collection = db.collection(collectionName);
      await restoreCollection(collection, data);
    } else {
      // Restore all collections
      const files = await readdir(BACKUP_DIR);
      const backupFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of backupFiles) {
        const collectionName = file.split('_')[0];
        const filePath = path.join(BACKUP_DIR, file);
        const data = JSON.parse(await readFile(filePath, 'utf8'));
        
        const collection = db.collection(collectionName);
        await restoreCollection(collection, data);
      }
    }
    
    console.log('Restore completed successfully');
  } catch (error) {
    console.error('Restore failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Handle command line arguments
const command = process.argv[2];
const collectionName = process.argv[3];

if (command === 'backup') {
  backup(collectionName);
} else if (command === 'restore') {
  restore(collectionName);
} else {
  console.log('Usage:');
  console.log('  npm run db:backup [collectionName]');
  console.log('  npm run db:restore [collectionName]');
  process.exit(1);
} 