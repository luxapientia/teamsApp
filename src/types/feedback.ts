import { QuarterType } from "./annualCorporateScorecard";

export interface Feedback {
  _id: string;
  name: string;
  status: 'Active' | 'Not Active';
  annualTargetId: string;
  tenantId: string;
  hasContent?: boolean;
  dimensions: FeedbackDimension[];
  responses: FeedbackResponse[];
  contributionScorePercentage?: number;
  enableFeedback: EnableFeedback[];
}

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
    quarter: QuarterType,
    enable: boolean;
}

