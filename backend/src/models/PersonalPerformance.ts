import { Schema, model, Document } from 'mongoose';
import { QuarterlyTargetKPI } from './AnnualTarget';


export enum AgreementStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved'
}

export enum AssessmentStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved'
}

interface PersonalQuarterlyTargetObjective {
  perspectiveId: number;
  name: string;
  initiativeName: string; 
  KPIs: QuarterlyTargetKPI[];
}

interface PersonalQuarterlyTarget {
  quarter: string;
  isEditable: boolean;
  agreementStatus: AgreementStatus;
  assessmentStatus: AssessmentStatus;
  supervisorId?: string;
  objectives: PersonalQuarterlyTargetObjective[];
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
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    agreementStatus: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved'],
      required: true,
      default: 'Draft',
    },
    assessmentStatus: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved'],
      required: true,
      default: 'Draft',
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
      perspectiveId: Number,
      name: String,
      initiativeName: String,
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
}, {
  timestamps: true,
});
export default model<PersonalPerformanceDocument>('PersonalPerformance', personalPerformanceSchema);
