import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  microsoftId: string;
  displayName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  microsoftId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

export const User = model<IUser>('User', userSchema); 
