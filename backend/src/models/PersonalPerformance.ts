import { Schema, model, Document } from 'mongoose';
import { QuarterlyTargetObjective } from './AnnualTarget';

interface PersonalQuarterlyTarget {
  quarter: string;
  isDraft: boolean;
  objectives: QuarterlyTargetObjective[];
}


export interface PersonalPerformanceDocument extends Document {
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
