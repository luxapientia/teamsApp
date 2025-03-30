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

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
} 