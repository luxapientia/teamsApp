import mongoose from 'mongoose';
import { License, LicenseStatus } from '../types';

const licenseSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true  // Only one license per company
  },
  licenseKey: {
    type: String,
    default: '',
    trim: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'expired'] as LicenseStatus[],
    default: 'inactive'
  }
}, {
  timestamps: true
});

// Drop the licenseKey index if it exists
const LicenseModel = mongoose.model<License & mongoose.Document>('License', licenseSchema);

// Drop the index in a non-blocking way
LicenseModel.collection.dropIndex('licenseKey_1')
  .then(() => console.log('Dropped licenseKey index'))
  .catch(err => {
    // Ignore if index doesn't exist
    if (err.code !== 27) {
      console.error('Error dropping index:', err);
    }
  });

export { LicenseModel }; 