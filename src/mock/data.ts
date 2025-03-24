import { Company, SuperUser, License, Status, LicenseStatus, LicenseType } from '../types';

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    status: 'active',
    createdOn: '2024-01-01',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    status: 'active',
    createdOn: '2024-02-15',
  },
  {
    id: '3',
    name: 'Global Solutions Ltd',
    status: 'inactive',
    createdOn: '2024-03-01',
  },
];

export const mockSuperUsers: SuperUser[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@acme.com',
    companyId: '1',
    status: 'active',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@techstart.com',
    companyId: '2',
    status: 'active',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@globalsolutions.com',
    companyId: '3',
    status: 'inactive',
  },
];

export const mockLicenses: License[] = [
  {
    id: '1',
    companyId: '1',
    licenseKey: 'ACME-2024-001',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    status: 'active',
  },
  {
    id: '2',
    companyId: '2',
    licenseKey: 'TECH-2024-002',
    startDate: '2024-02-15',
    endDate: '2025-02-15',
    status: 'active',
  },
  {
    id: '3',
    companyId: '3',
    licenseKey: 'GLOBAL-2024-003',
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    status: 'expired',
  },
]; 