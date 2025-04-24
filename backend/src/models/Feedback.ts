import { Schema, model, Document } from 'mongoose';

export interface FeedbackDimension {
  index: number;
  name: string;
  weight: number;
  questions: string[];
}
export interface FeedbackResponse {
  score: number;
  response: string;
}

export interface EnableFeedback {
  quarter: string;
  enable: boolean;
}



export interface FeedbackDocument extends Document {
  _id: string;
  annualTargetId: string;
  tenantId: string;
  name: string;
  status: string;
  hasContent: boolean;
  dimensions: FeedbackDimension[];
  responses: FeedbackResponse[];
  contributionScorePercentage?: number;
  enableFeedback: EnableFeedback[];
}

const feedbackSchema = new Schema<FeedbackDocument>({
  annualTargetId: {
    type: String,
    required: true,
    ref: 'AnnualTarget',
  },
  tenantId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  hasContent: {
    type: Boolean,
    required: true,
  },
  dimensions: {
    type: [{
      index: Number,
      name: String,
      weight: Number,
      questions: [String],
    }],
    required: true,
  },
  responses: {
    type: [{
      score: Number,
      response: String,
    }],
    required: true,
  },
  contributionScorePercentage: {
    type: Number,
    required: false,
  },
  enableFeedback: {
    type: [{
      quarter: String,
      enable: Boolean,
    }],
    required: true,
  },
}, {
  timestamps: true,
});
export default model<FeedbackDocument>('Feedback', feedbackSchema);
