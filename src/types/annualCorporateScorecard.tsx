export enum AnnualTargetStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export enum TargetTab {
    Quarterly = 'Quarterly Targets',
    Annual = 'Annual Targets'
}

export interface AnnualTarget {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: AnnualTargetStatus;
    content: AnnualTargetContent;
}

export interface AnnualTargetContent {
    perspectives: string[];
    objectives: AnnualTargetObjective[];
}

export interface AnnualTargetObjective {
    perspective: string;
    name: string;
    KPIs: AnnualTargetKPI[];
}

export interface AnnualTargetKPI {
    indicator: string;
    weight: number;
    baseline: string;
    target: string;
    ratingScores: AnnualTargetRatingScore[];
}

export interface AnnualTargetRatingScore {
    name: string;
    max: number;
    min: number;
}

