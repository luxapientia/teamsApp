import { Schema, model, Document } from 'mongoose';

export enum TrainingStatus {
  REQUESTED = 'Requested',
  PLANNED = 'Planned',
  COMPLETED = 'Completed'
}

export interface ITraining extends Document {
  planId: Schema.Types.ObjectId;
  userId: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  team?: string;
  trainingRequested: string;
  description?: string;
  status: TrainingStatus;
  dateRequested: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'OrgDevPlan',
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    jobTitle: String,
    team: String,
    trainingRequested: {
      type: String,
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: Object.values(TrainingStatus),
      default: TrainingStatus.REQUESTED
    },
    dateRequested: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const Training = model<ITraining>('Training', trainingSchema);
