import { Schema, model, Document } from 'mongoose';

export interface Quarter {
  quarter: string;
  start: string;
  end: string;
}

export interface ComplianceSettingDocument extends Document {
  year: number;
  firstMonth: string;
  quarters: Quarter[];
  tenantId: string;
}

const quarterSchema = new Schema<Quarter>({
  quarter: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
}, { _id: false });

const complianceSettingSchema = new Schema<ComplianceSettingDocument>({
  year: { type: Number, required: true },
  firstMonth: { type: String, required: true },
  quarters: { type: [quarterSchema], required: true },
  tenantId: { type: String, required: true },
}, {
  timestamps: true,
});

export default model<ComplianceSettingDocument>('ComplianceSetting', complianceSettingSchema); 