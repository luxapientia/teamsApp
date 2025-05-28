import { Schema, model, Document } from 'mongoose';

export interface ObligationDocument extends Document {
  complianceObligation: string;
  complianceArea: Schema.Types.ObjectId; // area _id
  frequency: string;
  lastDueDate: string;
  owner: Schema.Types.ObjectId; // team _id
  riskLevel: string;
  status: string;
}

const obligationSchema = new Schema<ObligationDocument>({
  complianceObligation: { type: String, required: true },
  complianceArea: { type: Schema.Types.ObjectId, ref: 'ComplianceArea', required: true },
  frequency: { type: String, required: true },
  lastDueDate: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  riskLevel: { type: String, required: true },
  status: { type: String, required: true, default: 'Active' },
}, {
  timestamps: true,
});

export default model<ObligationDocument>('Obligation', obligationSchema); 