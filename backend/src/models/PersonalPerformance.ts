import { Schema, model, Document } from 'mongoose';
import { QuarterlyTargetKPI } from './AnnualTarget';


export enum AgreementStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  SendBack = 'Send Back'
}

export enum AssessmentStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  SendBack = 'Send Back'
}

interface PersonalQuarterlyTargetObjective {
  perspectiveId: number;
  name: string;
  initiativeName: string; 
  KPIs: QuarterlyTargetKPI[];
}

export interface PersonalQuarterlyTarget {
  quarter: string;
  isEditable: boolean;
  agreementStatus: AgreementStatus;
  assessmentStatus: AssessmentStatus;
  supervisorId?: string;
  objectives: PersonalQuarterlyTargetObjective[];
  isPersonalDevelopmentNotApplicable?: boolean;
  personalDevelopment?: string[]; // Array of course IDs
}


export interface PersonalPerformanceDocument extends Document {
  _id: string;
  teamId: string;
  userId: string;
  tenantId: string;
  annualTargetId: string;
  quarterlyTargets: PersonalQuarterlyTarget[];
}

const personalPerformanceSchema = new Schema<PersonalPerformanceDocument>({
  teamId: {
    type: String,
    required: false,
    ref: 'Team',
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  tenantId: {
    type: String,
    required: true,
  },
  annualTargetId: {
    type: String,
    required: true,
  },
  quarterlyTargets: [{
    _id: false,
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4'],
      required: true
    },
    agreementStatus: {
      type: String,
      enum: Object.values(AgreementStatus),
      required: true,
      default: AgreementStatus.Draft,
    },
    assessmentStatus: {
      type: String,
      enum: Object.values(AssessmentStatus),
      required: true,
      default: AssessmentStatus.Draft,
    },
    isPersonalDevelopmentNotApplicable: {
      type: Boolean,
      required: false,
      default: false,
    },
    personalDevelopment: {
      type: [String],
      required: false,
      ref: 'Course',
      default: []
    },

    isEditable: {
      type: Boolean,
      required: true,
      default: false,
    },
    supervisorId: {
      type: String,
      required: false,
    },
    objectives: [{
      _id: false,
      perspectiveId: {
        type: Number,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      initiativeName: {
        type: String,
        required: true
      },
      KPIs: [{
        _id: false,
        indicator: {
          type: String,
          required: true
        },
        weight: {
          type: Number,
          required: true
        },
        baseline: {
          type: String,
          required: true
        },
        target: {
          type: String,
          required: true
        },
        ratingScales: [{
          _id: false,
          score: {
            type: Number,
            required: true
          },
          name: {
            type: String,
            required: true
          },
          max: {
            type: String,
            required: true
          },
          min: {
            type: String,
            required: true
          },
          color: {
            type: String,
            required: true
          }
        }],
        ratingScore: {
          type: Number,
          default: -1
        },
        actualAchieved: {
          type: String,
          default: ''
        },
        evidence: {
          type: String,
          default: ''
        },
        attachments: [{
          _id: false,
          name: String,
          url: String
        }]
      }]
    }]
  }]
}, {
  timestamps: true,
});
export default model<PersonalPerformanceDocument>('PersonalPerformance', personalPerformanceSchema);
