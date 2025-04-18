import mongoose, { Document, Schema } from 'mongoose';

export interface CourseDocument extends Document {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  tenantId: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

// Create indexes
courseSchema.index({ tenantId: 1 });
courseSchema.index({ name: 1, tenantId: 1 }, { unique: true });

export default mongoose.model<CourseDocument>('Course', courseSchema); 