import { QuarterlyTargetObjective } from "./annualCorporateScorecard";

export interface PersonalQuarterlyTargetObjective extends QuarterlyTargetObjective {
    initiativeName: string;
}

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



export interface PersonalQuarterlyTarget {
    quarter: string;
    agreementStatus: AgreementStatus;
    assessmentStatus: AssessmentStatus;
    isEditable: boolean;
    supervisorId?: string;
    objectives: PersonalQuarterlyTargetObjective[];
}

export interface PersonalPerformance {
    _id: string;
    annualTargetId: string;
    quarterlyTargets: PersonalQuarterlyTarget[];
}