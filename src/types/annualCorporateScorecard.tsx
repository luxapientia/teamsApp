export enum AnnualTargetStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export enum TargetTab {
    Quarterly = 'Quarterly Corporate Scorecards',
    Annual = 'Annual Corporate Scorecards'
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
    assessmentPeriod: AnnualTargetAssessmentPeriod;
    contractingPeriod: AnnualTargetContractingPeriod;
    totalWeight: number;
    quarterlyTarget: {
        editable: boolean;
        quarterlyTargets: QuarterlyTarget[];
    };
}

export interface AnnualTargetPerspective {
    index: number;
    name: string;
}

export interface AnnualTargetObjective {
    perspectiveId: number;
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

export interface AnnualTargetAssessmentPeriod {
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
    editable: boolean;
    isDevelopmentPlanEnabled?: boolean;
    objectives: QuarterlyTargetObjective[];
    selectedFeedbackId?: string;
}

export interface QuarterlyTargetObjective {
    perspectiveId: number;
    name: string;
    KPIs: QuarterlyTargetKPI[];
}

export interface QuarterlyTargetKPI {
    indicator: string;
    weight: number;
    baseline: string;
    target: string;
    ratingScales: AnnualTargetRatingScale[];
    ratingScore: number;
    actualAchieved: string;
    evidence: string;
    attachments: {
        name: string;
        url: string;
    }[];
}
