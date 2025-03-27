export enum AnnualScorecardStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export enum TargetTab {
    Quarterly = 'quarterly',
    Annual = 'annual'
}

export interface AnnualScorecard {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: AnnualScorecardStatus;
    content: AnnualScorecardContent[];
}

export interface AnnualScorecardContent {
    perspectives: string[];
    objectives: AnnualScorecardObjective[];
}

export interface AnnualScorecardObjective {
    perspective: string;
    name: string;
    KPIs: string[];
}

export interface AnnualScorecardKPI {
    indicator: string;
    weight: number;
    baseline: number;
    target: number;
    ratingScores: AnnualScorecardRatingScore[];
}

export interface AnnualScorecardRatingScore {
    name: string;
    max: number;
    min: number;
}

