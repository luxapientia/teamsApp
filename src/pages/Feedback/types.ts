export interface FeedbackForm {
  id: string;
  name: string;
  status: 'Active' | 'Not Active';
  hasContent?: boolean;
} 