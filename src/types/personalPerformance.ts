import { QuarterlyTargetObjective } from "./annualCorporateScorecard";

export interface PersonalQuarterlyTargetObjective extends QuarterlyTargetObjective {
    initiativeName: string;
}

export interface PersonalQuarterlyTarget {
    quarter: string;
    isDraft: boolean;
    objectives: PersonalQuarterlyTargetObjective[];
}

export interface PersonalPerformance {
    annualTargetId: string;
    quarterlyTargets: PersonalQuarterlyTarget[];
}