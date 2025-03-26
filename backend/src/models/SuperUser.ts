import mongoose, { Document, Schema } from 'mongoose';

export interface ISuperUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  companyId: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
}

const SuperUserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

export default mongoose.model<ISuperUser>('SuperUser', SuperUserSchema); 