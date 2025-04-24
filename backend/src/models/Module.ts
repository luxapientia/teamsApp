import mongoose, { Schema, model, Document } from 'mongoose';

export interface ModuleDocument extends Document {
  _id: string;
  moduleName: string;
  companies: mongoose.Types.ObjectId[];
}

const moduleSchema = new Schema<ModuleDocument>({
  moduleName: {
    type: String,
    required: true,
  },
  companies: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Company',
  },
}, {
  timestamps: true,
});
export default model<ModuleDocument>('Module', moduleSchema);
