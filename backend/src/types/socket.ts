export enum SocketEvent {
  PERFORMANCE_AGREEMENT_UPDATE = 'performance_agreement_update',
  ASSESSMENT_UPDATE = 'assessment_update',
  NOTIFICATION = 'notification'
}

export interface SocketData {
  recipientId: string;
  status: string;
  timestamp?: string;
} 