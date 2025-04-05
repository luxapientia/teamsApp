import mongoose from 'mongoose';
import { UserRole, UserRoleAssignment } from '../types/role';

const userRoleSchema = new mongoose.Schema<UserRoleAssignment>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
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
    required: true,
    immutable: true // This makes the role field unchangeable after creation
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false,
    immutable: true // Company association is also permanent
  }
});

// Middleware to prevent role changes
userRoleSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified('role')) {
    const err = new Error('Role cannot be modified once set');
    return next(err);
  }
  next();
});

export const UserRoleModel = mongoose.model<UserRoleAssignment>('UserRole', userRoleSchema); 