export type BaseEntity = {
  id: string;
};

export type Status = 'active' | 'inactive';
export type LicenseStatus = 'active' | 'expired' | 'pending';

export interface Company extends BaseEntity {
  name: string;
  description: string;
  status: Status;
}

export interface SuperUser extends BaseEntity {
  name: string;
  email: string;
  company: string;
  status: Status;
}

export interface License extends BaseEntity {
  company: string;
  type: string;
  startDate: string;
  endDate: string;
  status: LicenseStatus;
} 