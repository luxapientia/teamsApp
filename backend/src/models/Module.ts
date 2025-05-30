import mongoose, { Schema, model, Document } from 'mongoose';

export interface ModuleDocument extends Document {
  _id: string;
  moduleName: string;
  description: string;
  companies: mongoose.Types.ObjectId[];
  enabled: boolean;
}

const moduleSchema = new Schema<ModuleDocument>({
  moduleName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  companies: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Company',
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
});
export default model<ModuleDocument>('Module', moduleSchema);
