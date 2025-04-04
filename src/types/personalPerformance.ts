import { QuarterlyTargetObjective } from "./annualCorporateScorecard";

export interface PersonalQuarterlyTargetObjective extends QuarterlyTargetObjective {
    initiativeName: string;
}

export interface PersonalQuarterlyTarget {
    quarter: string;
    isDraft: boolean;
    isEditable: boolean;
    supervisorId?: string;
    objectives: PersonalQuarterlyTargetObjective[];
}

export interface PersonalPerformance {
    _id: string;
    annualTargetId: string;
    quarterlyTargets: PersonalQuarterlyTarget[];
}