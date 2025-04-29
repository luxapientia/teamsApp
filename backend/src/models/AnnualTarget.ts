import { Schema, model, Document } from 'mongoose';

export enum AnnualTargetStatus {
  Active = 'active',
  Inactive = 'inactive'
}

interface AnnualTargetContent {
  perspectives: AnnualTargetPerspective[];
  objectives: AnnualTargetObjective[];
  ratingScales: AnnualTargetRatingScale[];
  assessmentPeriod: AnnualTargetAssessmentPeriod;
  contractingPeriod: AnnualTargetContractingPeriod;
  totalWeight: number;
  quarterlyTarget: {
    editable: boolean;
    quarterlyTargets: QuarterlyTarget[];
  };
}

interface AnnualTargetPerspective {
  index: number;
  name: string;
}

interface AnnualTargetObjective {
  perspectiveId: number;
  name: string;
  KPIs: AnnualTargetKPI[];
}

export interface AnnualTargetKPI {
  indicator: string;
  weight: number;
  baseline: string;
  target: string;
  ratingScales: AnnualTargetRatingScale[];
}

interface AnnualTargetRatingScale {
  score: number;
  name: string;
  max: string;
  min: string;
  color: string;
}

interface AnnualTargetAssessmentPeriod {
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

export interface QuarterlyTarget {
  quarter: QuarterType;
  isDevelopmentPlanEnabled?: boolean;
  objectives: QuarterlyTargetObjective[];
}

export interface QuarterlyTargetObjective {
  perspectiveId: number;
  name: string;
  KPIs: QuarterlyTargetKPI[];
} 

export interface QuarterlyTargetKPI {
  indicator: string;
  weight: number;
  baseline: string;
  target: string;
  ratingScales: AnnualTargetRatingScale[];
  ratingScore: number;
  actualAchieved: string;
  evidence: string;
  attachments: {
    name: string;
    url: string;
  }[];  
}

export interface AnnualTargetDocument extends Document {
  _id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AnnualTargetStatus;
  content: AnnualTargetContent;
}

const annualTargetSchema = new Schema<AnnualTargetDocument>({
  tenantId: {
    type: String,
    required: true
  },
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
    perspectives: [{
      index: Number,
      name: String
    }],
    objectives: [{
      perspectiveId: Number,
      name: String,
      KPIs: [{
        indicator: String,
        weight: Number,
        baseline: String,
        target: String,
        ratingScales: [{
          score: Number,
          name: String,
          max: String,
          min: String,
          color: String
        }]
      }]
    }],
    ratingScales: [{
      score: Number,
      name: String,
      max: String,
      min: String,
      color: String
    }],
    assessmentPeriod: {
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
        editable: {
          type: Boolean,
          default: true
        },
        isDevelopmentPlanEnabled: {
          type: Boolean,
          require: false,
          default: false
        },
        objectives: [{
          perspectiveId: Number,
          name: String,
          KPIs: [{
            indicator: String,
            weight: Number,
            baseline: String,
            target: String,
            ratingScales: [{
              score: Number,
              name: String,
              max: String,
              min: String,
              color: String
            }],
            ratingScore: Number,
            actualAchieved: {
              type: String,
              default: ''
            },
            evidence: {
              type: String,
              default: ''
            },
            attachments: {
              type: [{
                name: String,
                url: String
              }],
              default: []
            }
          }]
        }]
      }]
    }
  }
}, {
  timestamps: true,
});

export default model<AnnualTargetDocument>('AnnualTarget', annualTargetSchema); 
