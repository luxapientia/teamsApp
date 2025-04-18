export interface Course {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
} 