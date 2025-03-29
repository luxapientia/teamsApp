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
    ratingScales: AnnualTargetRatingScale[];
    assesmentPeriod: AnnualTargetAssesmentPeriod;
    contractingPeriod: AnnualTargetContractingPeriod;
    totalWeight: number;
    quarterlyTarget: {
        editable: boolean;
        quarterlyTargets: QuarterlyTarget[];
    };
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
    ratingScales: AnnualTargetRatingScale[];
}

export interface AnnualTargetRatingScale {
    score: number;
    name: string;
    max: number;
    min: number;
    color: string;
}

export interface AnnualTargetAssesmentPeriod {
    Q1: {
        startDate: string;
        endDate: string;
    },
    Q2: {
        startDate: string;
        endDate: string;
    },
    Q3: {
        startDate: string;
        endDate: string;
    },
    Q4: {
        startDate: string;
        endDate: string;
    }
}

export interface AnnualTargetContractingPeriod {
    Q1: {
        startDate: string;
        endDate: string;
    },
    Q2: {
        startDate: string;
        endDate: string;
    },
    Q3: {
        startDate: string;
        endDate: string;
    },
    Q4: {
        startDate: string;
        endDate: string;
    }
}

export type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface QuarterlyTarget {
    quarter: QuarterType;
    objectives: AnnualTargetObjective[];
}
