export type BaseEntity = {
  _id: string;
  __v?: number;
};

export type Status = 'active' | 'inactive';
export type LicenseStatus = 'active' | 'inactive' | 'pending' | 'expired';
export type LicenseType = 'Basic' | 'Professional' | 'Enterprise';

export interface Company extends BaseEntity {
  name: string;
  status: Status;
  createdOn: string;
  tenantId: string;
}

export interface SuperUser extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  status: Status;
}

export interface License extends BaseEntity {
  companyId: string;
  licenseKey: string;
  startDate: string;
  endDate: string;
  status: LicenseStatus;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  organization?: string;
  role: string;
  status?: 'active' | 'inactive';
  tenantId?: string;
  organizationName?: string;
  isDevMember?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
} 