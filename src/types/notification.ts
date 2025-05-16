import { QuarterType } from "./annualCorporateScorecard";

export interface Notification {
    _id: string;
    type: 'agreement' | 'assessment' | 'resolve_agreement' | 'resolve_assessment';
    sender: {
        _id: string;
        fullName: string;
        teamId: string;
    };
    annualTargetId: string;
    quarter: QuarterType;
    isRead: boolean;
    updatedAt: string;
}
