import { Schema, model, Document } from 'mongoose';
import { QuarterlyTargetObjective } from './AnnualTarget';

interface PersonalQuarterlyTarget {
  quarter: string;
  isDraft: boolean;
  supervisorId?: string;
  objectives: QuarterlyTargetObjective[];
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
    isDraft: {
      type: Boolean,
      required: true,
      default: true,
    },
    supervisorId: {
      type: String,
      required: false,
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
}, {
  timestamps: true,
});
export default model<PersonalPerformanceDocument>('PersonalPerformance', personalPerformanceSchema);
