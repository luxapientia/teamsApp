import mongoose from 'mongoose';

export interface TeamDocument extends mongoose.Document {
  name: string;
  tenantId: string;
  createdAt: Date;
}
const teamSchema = new mongoose.Schema<TeamDocument>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tenantId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Team = mongoose.model('Team', teamSchema);