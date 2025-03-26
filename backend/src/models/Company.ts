import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  status: 'active' | 'inactive';
  createdOn: Date;
}

const CompanySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
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

export default mongoose.model<ICompany>('Company', CompanySchema); 