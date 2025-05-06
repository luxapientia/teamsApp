import { QuarterlyTargetObjective, QuarterType } from "./annualCorporateScorecard";
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

export enum AgreementReviewStatus {
    NotReviewed = 'Not Reviewed',
    Reviewed = 'Reviewed',
    SendBack = 'Send Back'
}

export enum AssessmentReviewStatus {
    NotReviewed = 'Not Reviewed',
    Reviewed = 'Reviewed',
    SendBack = 'Send Back'
}



export interface PersonalQuarterlyTargetFeedbackProvider {
    name: string;
    email: string;
    category: string;
    status: 'Not Shared' | 'Pending' | 'Completed';
}

export interface PersonalQuarterlyTargetFeedback {
    _id?: string;
    feedbackId: string;
    provider: PersonalQuarterlyTargetFeedbackProvider;
    feedbacks: {
        dimension: string;
        question: string;
        response: {
            score: number;
            response: string;
        };
        reason: string;
    }[];
}

export interface PersonalQuarterlyTarget {
    quarter: QuarterType;
    agreementStatus: AgreementStatus;
    agreementStatusUpdatedAt: Date;
    assessmentStatus: AssessmentStatus;
    assessmentStatusUpdatedAt: Date;
    agreementReviewStatus?: AgreementReviewStatus;
    assessmentReviewStatus?: AssessmentReviewStatus;
    isEditable: boolean;
    supervisorId?: string;
    objectives: PersonalQuarterlyTargetObjective[];
    personalDevelopment?: Array<Course>;
    isPersonalDevelopmentNotApplicable?: boolean;
    selectedFeedbackId?: string;
    feedbacks: PersonalQuarterlyTargetFeedback[];
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
    isTeamOwner?: boolean;
}

