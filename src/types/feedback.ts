import { QuarterType } from "./annualCorporateScorecard";

export interface Feedback {
  _id: string;
  name: string;
  status: 'Active' | 'Not Active';
  annualTargetId: string;
  tenantId: string;
  hasContent?: boolean;
  dimensions: FeedbackDemension[];
  questions: FeedbackQuestion[];
  responses: FeedbackResponse[];
  contributionScores: ContributionScore[];
  enableFeedback: EnableFeedback[];
}

export interface FeedbackDemension {
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
    quarter: QuarterType,
    enable: boolean;
}

