export interface Notification {
    type: 'quarterlyTarget' | 'performanceAssessment';
    data: QuarterlyTargetNotification | PerformanceAssessmentNotification;
}

export interface QuarterlyTargetNotification {
    _id: string;
    sender: {
        _id: string;
        fullName: string;
        team: string;
    };
    recipient: {
        _id: string;
        fullName: string;
        team: string;
    };
    annualTargetId: string;
    quarter: number;
    isRead: boolean;
    createdAt: string;
}

export interface PerformanceAssessmentNotification {
    _id: string;
    sender: {
        _id: string;
        fullName: string;
        team: string;
    };
    recipient: {
        _id: string;
        fullName: string;
        team: string;
    };
    performanceEvaluationId: string;
    createdAt: string;
}