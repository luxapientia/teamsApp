import { Schema, model, Document } from 'mongoose';

export interface ComplianceAreaDocument extends Document {
    _id: string;
    areaName: string;
    description: string;
}

const complianceAreaSchema = new Schema<ComplianceAreaDocument>({
    areaName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export default model<ComplianceAreaDocument>('ComplianceArea', complianceAreaSchema);
