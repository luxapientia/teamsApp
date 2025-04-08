import mongoose from 'mongoose';

export interface TeamDocument extends mongoose.Document {
  name: string;
  tenantId: string;
  owner: string; // MicrosoftId of the team owner
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
  owner: {
    type: String,
    required: false, // Can be set after team creation
    ref: 'User'  // Reference to User model
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<TeamDocument>('Team', teamSchema);