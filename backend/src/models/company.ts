import mongoose from 'mongoose';
import { Company } from '../types';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

export const CompanyModel = mongoose.model<Company & mongoose.Document>('Company', companySchema); 