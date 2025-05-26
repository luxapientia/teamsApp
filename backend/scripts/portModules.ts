import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Use absolute paths relative to the project root
import Module from '../src/models/Module'; // <-- likely correct for your structure
import { config } from '../src/config';

async function main() {
  // Connect to MongoDB
  await mongoose.connect(config.mongoUri);

  // Read module.json
  const moduleJsonPath = path.resolve(__dirname, '../resources/module.json');
  const modules = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));

  for (const mod of modules) {
    // Upsert module by moduleName
    await Module.findOneAndUpdate(
      { moduleName: mod.moduleName },
      { $set: mod },
      { upsert: true, new: true }
    );
    console.log(`Ported module: ${mod.moduleName}`);
  }

  await mongoose.disconnect();
  console.log('Module porting complete.');
}

main().catch(err => {
  console.error('Error porting modules:', err);
  process.exit(1);
});
