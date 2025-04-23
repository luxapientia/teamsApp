import { Schema, model, Document } from 'mongoose';

export interface FeedbackDimension {
  index: number;
  name: string;
  weight: number;
}

export interface FeedbackQuestion {
  dimensionIndex: number;
  question: string;
}

export interface FeedbackResponse {
  score: number;
  response: string;
}

export interface ContributionScore {
  contribution: string;
  score: number;
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
  questions: FeedbackQuestion[];
  responses: FeedbackResponse[];
  contributionScores: ContributionScore[];
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
    }],
    required: true,
  },
  questions: {
    type: [{
      dimensionIndex: Number,
      question: String,
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
  contributionScores: {
    type: [{
      contribution: String,
      score: Number,
    }],
    required: true,
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
