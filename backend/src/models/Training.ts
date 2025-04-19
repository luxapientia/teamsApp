import { Schema, model, Document } from 'mongoose';

export enum TrainingStatus {
  REQUESTED = 'Requested',
  PLANNED = 'Planned',
  COMPLETED = 'Completed'
}

export interface ITraining extends Document {
  planId: Schema.Types.ObjectId;
  microsoftId: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  team?: string;
  trainingRequested: string;
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
    microsoftId: {
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
