import mongoose from 'mongoose';
import { UserRole, dUser } from '../types/user';

const userSchema = new mongoose.Schema<dUser>({
  MicrosoftId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  tenantId: {
    type: String,
    required: false,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false,
  }
});

export default mongoose.model<dUser>('User', userSchema); 