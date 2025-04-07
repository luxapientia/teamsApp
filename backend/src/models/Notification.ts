import { Schema, model, Document } from 'mongoose';

export interface NotificationDocument extends Document {
  _id: string;
  senderId: string;
  recipientId: string;
  annualTargetId: string;
  personalPerformanceId: string;
  quarter: string;
  isRead: boolean;
  type: string;
}

const notificationSchema = new Schema<NotificationDocument>({
  senderId: {
    type: String,
    required: true,
    ref: 'User',
  },
  recipientId: {
    type: String,
    required: true,
    ref: 'User',
  },
  annualTargetId: {
    type: String,
    required: true,
    ref: 'AnnualTarget',
  },
  personalPerformanceId: {
    type: String,
    required: true,
    ref: 'PersonalPerformance',
  },
  quarter: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});
export default model<NotificationDocument>('Notification', notificationSchema);
