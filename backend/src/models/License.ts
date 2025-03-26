import mongoose, { Document, Schema } from 'mongoose';

export interface ILicense extends Document {
  companyId: mongoose.Types.ObjectId;
  licenseKey: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'pending';
}

const LicenseSchema: Schema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  licenseKey: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'pending'],
    default: 'pending'
  }
});

// Index for faster queries
LicenseSchema.index({ companyId: 1 });
LicenseSchema.index({ licenseKey: 1 });

export default mongoose.model<ILicense>('License', LicenseSchema); 