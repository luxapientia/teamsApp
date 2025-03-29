import { Schema, model, Document } from 'mongoose';

enum AnnualTargetStatus {
  Active = 'active',
  Inactive = 'inactive'
}

interface AnnualTargetContent {
  perspectives: string[];
  objectives: AnnualTargetObjective[];
  ratingScores: AnnualTargetRatingScore[];
  assesmentPeriod: AnnualTargetAssesmentPeriod;
  contractingPeriod: AnnualTargetContractingPeriod;
  totalWeight: number;
  quarterlyTarget: {
    editable: boolean;
    quarterlyTargets: QuarterlyTarget[];
  };
}

interface AnnualTargetObjective {
  perspective: string;
  name: string;
  KPIs: AnnualTargetKPI[];
}

interface AnnualTargetKPI {
  indicator: string;
  weight: number;
  baseline: string;
  target: string;
  ratingScores: AnnualTargetRatingScore[];
}

interface AnnualTargetRatingScore {
  score: number;
  name: string;
  max: number;
  min: number;
  color: string;
}

interface AnnualTargetAssesmentPeriod {
  Q1: {
    startDate: string;
    endDate: string;
  },
  Q2: {
    startDate: string;
    endDate: string;
  },
  Q3: {
    startDate: string;
    endDate: string;
  },
  Q4: {
    startDate: string;
    endDate: string;
  }
}

interface AnnualTargetContractingPeriod {
  Q1: {
    startDate: string;
    endDate: string;
  },
  Q2: {
    startDate: string;
    endDate: string;
  },
  Q3: {
    startDate: string;
    endDate: string;
  },
  Q4: {
    startDate: string;
    endDate: string;
  }
}

type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

interface QuarterlyTarget {
  quarter: QuarterType;
  objectives: AnnualTargetObjective[];
}


export interface AnnualTarget extends Document {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AnnualTargetStatus;
  content: AnnualTargetContent;
}

const annualTargetSchema = new Schema<AnnualTarget>({
  
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(AnnualTargetStatus),
    required: true
  },
  content: {
    perspectives: {
      type: [String],
      default: []
    },
    objectives: [{
      perspective: String,
      name: String,
      KPIs: [{
        indicator: String,
        weight: Number,
        baseline: String,
        target: String,
        ratingScores: [{
          score: Number,
          name: String,
          max: Number,
          min: Number,
          color: String
        }]
      }]
    }],
    ratingScores: [{
      score: Number,
      name: String,
      max: Number,
      min: Number,
      color: String
    }],
    assesmentPeriod: {
      Q1: {
        startDate: String,
        endDate: String
      },
      Q2: {
        startDate: String,
        endDate: String
      },
      Q3: {
        startDate: String,
        endDate: String
      },
      Q4: {
        startDate: String,
        endDate: String
      }
    },
    contractingPeriod: {
      Q1: {
        startDate: String,
        endDate: String
      },
      Q2: {
        startDate: String,
        endDate: String
      },
      Q3: {
        startDate: String,
        endDate: String
      },
      Q4: {
        startDate: String,
        endDate: String
      }
    },
    totalWeight: {
      type: Number,
      default: 0
    },
    quarterlyTarget: {
      editable: {
        type: Boolean,
        default: false
      },
      quarterlyTargets: [{
        quarter: {
          type: String,
          enum: ['Q1', 'Q2', 'Q3', 'Q4']
        },
        objectives: [{
          perspective: String,
          name: String,
          KPIs: [{
            indicator: String,
            weight: Number,
            baseline: String,
            target: String,
            ratingScores: [{
              score: Number,
              name: String,
              max: Number,
              min: Number,
              color: String
            }]
          }]
        }]
      }]
    }
  }
}, {
  timestamps: true,
});

export const AnnualTarget = model<AnnualTarget>('AnnualTarget', annualTargetSchema); 