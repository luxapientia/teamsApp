import { Schema, model } from 'mongoose';

interface IOrgDevPlan {
  name: string;
  tenantId: string;
  trainings: Schema.Types.ObjectId[];
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
  }]
});

const OrgDevPlan = model('OrgDevPlan', orgDevPlanSchema);

export default OrgDevPlan; 