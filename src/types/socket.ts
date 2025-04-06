export enum SocketEvent {
  PERFORMANCE_AGREEMENT_UPDATE = 'performance_agreement_update',
  ASSESSMENT_UPDATE = 'assessment_update',
  NOTIFICATION = 'notification'
}

export interface SocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface SocketResponse {
  success: boolean;
  message?: string;
  data?: any;
} 