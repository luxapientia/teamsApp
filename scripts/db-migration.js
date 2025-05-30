const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamsapp1';
const BACKUP_ROOT_DIR = path.join(__dirname, '../backups');

// Get today's date as YYYY-MM-DD_HH-mm-ss
function getDateTimeString() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const date = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  const time = pad(now.getHours()) + '-' + pad(now.getMinutes()) + '-' + pad(now.getSeconds());
  return `${date}_${time}`;
}

// Ensure backup directory exists
async function ensureBackupDir(dir) {
  try {
    console.log('Creating backup directory at:', dir);
    await mkdir(dir, { recursive: true });
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
async function saveCollection(collection, collectionName, backupDir) {
  console.log(`Starting backup for collection: ${collectionName}`);
  const data = await collection.find({}).toArray();
  console.log(`Found ${data.length} documents in collection ${collectionName}`);

  // For each document, record the type of each field (ObjectId, Date, undefined, etc.)
  function getFieldTypes(doc, prefix = '') {
    let types = {};
    for (const key in doc) {
      const value = doc[key];
      const path = prefix ? `${prefix}.${key}` : key;
      if (value instanceof ObjectId) {
        types[path] = 'ObjectId';
      } else if (value instanceof Date) {
        types[path] = 'Date';
      } else if (typeof value === 'undefined') {
        types[path] = 'undefined';
      } else if (value === null) {
        types[path] = 'null';
      } else if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(types, getFieldTypes(item, `${path}.${idx}`));
          } else if (typeof item === 'undefined') {
            types[`${path}.${idx}`] = 'undefined';
          } else if (item instanceof ObjectId) {
            types[`${path}.${idx}`] = 'ObjectId';
          } else if (item instanceof Date) {
            types[`${path}.${idx}`] = 'Date';
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(types, getFieldTypes(value, path));
      }
    }
    return types;
  }

  function encodeSpecials(doc) {
    if (Array.isArray(doc)) {
      return doc.map(encodeSpecials);
    } else if (doc && typeof doc === 'object') {
      const out = {};
      for (const key in doc) {
        if (typeof doc[key] === 'undefined') {
          out[key] = '__UNDEFINED__';
        } else if (doc[key] instanceof Date) {
          out[key] = doc[key].toISOString();
        } else if (doc[key] instanceof ObjectId) {
          out[key] = doc[key].toString();
        } else if (typeof doc[key] === 'object') {
          out[key] = encodeSpecials(doc[key]);
        } else {
          out[key] = doc[key];
        }
      }
      return out;
    }
    return doc;
  }

  const dataWithMeta = data.map(doc => {
    const fieldTypes = getFieldTypes(doc);
    const encodedDoc = encodeSpecials(doc);
    return { ...encodedDoc, __fieldTypes: fieldTypes };
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${collectionName}_${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

  console.log(`Writing backup to file: ${filePath}`);
  await writeFile(filePath, JSON.stringify(dataWithMeta, null, 2));
  console.log(`Successfully saved ${collectionName} to ${fileName}`);
  return fileName;
}

// Restore field types from __fieldTypes
function setFieldByPath(obj, path, value) {
  const parts = path.split('.');
  if (parts.length === 1) {
    obj[parts[0]] = value;
    return;
  }
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current == null) return;
    const part = parts[i];
    if (/^\d+$/.test(part)) {
      current = current[parseInt(part, 10)];
    } else {
      current = current[part];
    }
  }
  const last = parts[parts.length - 1];
  current[last] = value;
}

function reviveFieldTypes(obj) {
  if (Array.isArray(obj)) {
    return obj.map(reviveFieldTypes);
  } else if (obj && typeof obj === 'object') {
    if (obj.__fieldTypes) {
      for (const path in obj.__fieldTypes) {
        const type = obj.__fieldTypes[path];
        let value = obj;
        const parts = path.split('.');
        for (let i = 0; i < parts.length; i++) {
          if (value == null) break;
          value = value[parts[i]];
        }
        if (type === 'ObjectId' && typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)) {
          setFieldByPath(obj, path, new ObjectId(value));
        } else if (type === 'Date' && typeof value === 'string') {
          setFieldByPath(obj, path, new Date(value));
        } else if (type === 'undefined') {
          setFieldByPath(obj, path, undefined);
        } else if (type === 'null') {
          setFieldByPath(obj, path, null);
        }
      }
      delete obj.__fieldTypes;
    }
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        obj[key] = reviveFieldTypes(obj[key]);
      }
    }
    // Convert any '__UNDEFINED__' back to undefined
    for (const key in obj) {
      if (obj[key] === '__UNDEFINED__') {
        obj[key] = undefined;
      }
    }
    return obj;
  }
  return obj;
}

// Restore collection from file
async function restoreCollection(collection, data) {
  if (data.length === 0) {
    console.log('No data to restore');
    return;
  }

  // Convert fields back to original types
  const revivedData = data.map(reviveFieldTypes);

  // Clear existing data
  await collection.deleteMany({});
  // Insert new data
  await collection.insertMany(revivedData);
  console.log(`Restored ${data.length} documents`);
}

// Main backup function
async function backup(collectionName = null) {
  console.log('Starting backup process...');
  console.log('MongoDB URI:', MONGODB_URI);
  
  const client = new MongoClient(MONGODB_URI);
  const dateTime = getDateTimeString();
  const BACKUP_DIR = path.join(BACKUP_ROOT_DIR, dateTime);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    await ensureBackupDir(BACKUP_DIR);
    
    if (collectionName) {
      // Backup specific collection
      console.log(`Backing up specific collection: ${collectionName}`);
      const collection = db.collection(collectionName);
      await saveCollection(collection, collectionName, BACKUP_DIR);
    } else {
      // Backup all collections
      console.log('Backing up all collections...');
      const collections = await db.listCollections().toArray();
      console.log(`Found ${collections.length} collections to backup`);
      
      for (const { name } of collections) {
        const collection = db.collection(name);
        await saveCollection(collection, name, BACKUP_DIR);
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
async function restore(collectionName = null, backupFolder = null) {
  console.log('Starting restore process...');
  if (!backupFolder) {
    console.error('No backup folder specified.');
    process.exit(1);
  }
  const BACKUP_DIR = path.join(BACKUP_ROOT_DIR, backupFolder);
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
        console.error(`No backup files found for collection: ${collectionName} in folder: ${backupFolder}`);
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
let collectionName = process.argv[3];
let backupFolderArg = process.argv[4];

// If only a backup folder is provided (no collection name), shift the arguments
if (command === 'restore' && !backupFolderArg && collectionName) {
  backupFolderArg = collectionName;
  collectionName = null;
}

if (command === 'backup') {
  backup(collectionName);
} else if (command === 'restore') {
  if (!backupFolderArg) {
    console.log('Please specify the backup folder (e.g., 2024-05-30_14-23-45) as the third argument.');
    console.log('Usage: npm run db:restore [collectionName] <backupFolder>');
    process.exit(1);
  }
  restore(collectionName, backupFolderArg);
} else {
  console.log('Usage:');
  console.log('  npm run db:backup [collectionName]');
  console.log('  npm run db:restore [collectionName] <backupFolder>');
  process.exit(1);
} 