import { Status, LicenseStatus } from '../types';

export const STATUS_OPTIONS = [
  { value: 'active' as Status, label: 'Active' },
  { value: 'inactive' as Status, label: 'Inactive' },
];

export const LICENSE_STATUS_OPTIONS = [
  { value: 'active' as LicenseStatus, label: 'Active' },
  { value: 'pending' as LicenseStatus, label: 'Pending' },
  { value: 'expired' as LicenseStatus, label: 'Expired' },
];

export const LICENSE_TYPE_OPTIONS = [
  { value: 'Basic', label: 'Basic' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Enterprise', label: 'Enterprise' },
]; 