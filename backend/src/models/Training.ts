import { Schema, model, Document } from 'mongoose';

export enum TrainingStatus {
  REQUESTED = 'REQUESTED',
  PLANNED = 'PLANNED',
  COMPLETED = 'COMPLETED'
}

export interface ITraining extends Document {
  courseId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  planId: Schema.Types.ObjectId;
  status: TrainingStatus;
  requestedDate: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TrainingStatus),
      required: true,
      default: TrainingStatus.REQUESTED,
    },
    requestedDate: {
      type: Date,
      required: true,
      default: Date.now,
    }
  }
);

export const Training = model<ITraining>('Training', trainingSchema);
