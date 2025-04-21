import { QuarterlyTargetObjective } from "./annualCorporateScorecard";
import { Course } from "./course";

export interface PersonalQuarterlyTargetObjective extends QuarterlyTargetObjective {
    initiativeName: string;
}

export enum AgreementStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    Approved = 'Approved',
    SendBack = 'Send Back'
}

export enum AssessmentStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    Approved = 'Approved',
    SendBack = 'Send Back'
}

export interface PersonalQuarterlyTarget {
    quarter: string;
    agreementStatus: AgreementStatus;
    assessmentStatus: AssessmentStatus;
    isEditable: boolean;
    supervisorId?: string;
    objectives: PersonalQuarterlyTargetObjective[];
    personalDevelopment?: Array<Course>;
    isPersonalDevelopmentNotApplicable?: boolean;
}

export interface PersonalPerformance {
    _id: string;
    annualTargetId: string;
    teamId: string;
    quarterlyTargets: PersonalQuarterlyTarget[];
    userId?: string | { _id: string };
}

export interface TeamPerformance extends PersonalPerformance {
    fullName: string;
    jobTitle: string;
    team: string;
    email?: string;
}

