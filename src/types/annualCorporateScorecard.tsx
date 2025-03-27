export enum AnnualTargetStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export enum TargetTab {
    Quarterly = 'quarterly',
    Annual = 'annual'
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
    baseline: number;
    target: number;
    ratingScores: AnnualTargetRatingScore[];
}

export interface AnnualTargetRatingScore {
    name: string;
    max: number;
    min: number;
}

