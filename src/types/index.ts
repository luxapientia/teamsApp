export type BaseEntity = {
  id: string;
};

export type Status = 'active' | 'inactive';
export type LicenseStatus = 'active' | 'pending' | 'expired';
export type LicenseType = 'Basic' | 'Professional' | 'Enterprise';

export interface Company {
  id: string;
  name: string;
  status: Status;
  createdOn: string;
}

export interface SuperUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  status: Status;
}

export interface License {
  id: string;
  companyId: string;
  licenseKey: string;
  startDate: string;
  endDate: string;
  status: LicenseStatus;
} 