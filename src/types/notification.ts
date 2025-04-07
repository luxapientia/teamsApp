export interface Notification {
    _id: string;
    type: 'agreement' | 'assessment';
    sender: {
        _id: string;
        fullName: string;
        team: string;
    };
    annualTargetId: string;
    quarter: number;
    isRead: boolean;
    updatedAt: string;
}
