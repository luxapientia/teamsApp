import { Schema, model, Document } from 'mongoose';
import { QuarterlyTargetKPI } from './AnnualTarget';


interface PersonalQuarterlyTargetObjective {
  perspectiveId: number;
  name: string;
  initiativeName: string; 
  KPIs: QuarterlyTargetKPI[];
}

interface PersonalQuarterlyTarget {
  quarter: string;
  isEditable: boolean;
  isAgreementDraft: boolean;
  isAssessmentDraft: boolean;
  supervisorId?: string;
  objectives: PersonalQuarterlyTargetObjective[];
}


export interface PersonalPerformanceDocument extends Document {
  _id: string;
  userId: string;
  annualTargetId: string;
  quarterlyTargets: PersonalQuarterlyTarget[];
}

const personalPerformanceSchema = new Schema<PersonalPerformanceDocument>({
  userId: {
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
    isAgreementDraft: {
      type: Boolean,
      required: true,
      default: true,
    },
    isAssessmentDraft: {
      type: Boolean,
      required: true,
      default: true,
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
