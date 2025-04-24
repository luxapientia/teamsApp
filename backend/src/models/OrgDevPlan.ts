import { Schema, model } from 'mongoose';

export interface IOrgDevPlan {
  _id: string;
  name: string;
  tenantId: string;
  trainings: Schema.Types.ObjectId[];
  isFinalized: boolean;
}

const orgDevPlanSchema = new Schema<IOrgDevPlan>({
  name: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true
  },
  trainings: [{
    type: Schema.Types.ObjectId,
    ref: 'Training'
  }],
  isFinalized: {
    type: Boolean,
    default: false
  }
});

const OrgDevPlan = model('OrgDevPlan', orgDevPlanSchema);

export default OrgDevPlan; 