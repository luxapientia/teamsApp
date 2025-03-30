export enum AnnualTargetStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export enum TargetTab {
    Quarterly = 'Quarterly Targets',
    Annual = 'Annual Targets'
}

export interface AnnualTarget {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: AnnualTargetStatus;
    content: AnnualTargetContent;
}

export interface AnnualTargetContent {
    perspectives: AnnualTargetPerspective[];
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

export interface AnnualTargetPerspective {
    order: number;
    name: string;
}

export interface AnnualTargetObjective {
    perspective: AnnualTargetPerspective;
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
    max: string;
    min: string;
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
