import { Company, SuperUser, License } from '../types';

export const mockCompanies: Company[] = [
  { id: '1', name: 'Microsoft', description: 'Technology company', status: 'active' },
  { id: '2', name: 'Contoso Ltd', description: 'Sample company', status: 'active' },
  { id: '3', name: 'Fabrikam Inc', description: 'Manufacturing company', status: 'inactive' },
];

export const mockSuperUsers: SuperUser[] = [
  { id: '1', name: 'John Doe', email: 'john@microsoft.com', company: 'Microsoft', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@contoso.com', company: 'Contoso Ltd', status: 'active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@fabrikam.com', company: 'Fabrikam Inc', status: 'inactive' },
];

export const mockLicenses: License[] = [
  { 
    id: '1', 
    company: 'Microsoft', 
    type: 'Enterprise', 
    startDate: '2024-01-01', 
    endDate: '2024-12-31', 
    status: 'active' 
  },
  { 
    id: '2', 
    company: 'Contoso Ltd', 
    type: 'Professional', 
    startDate: '2024-03-01', 
    endDate: '2025-02-28', 
    status: 'pending' 
  },
  { 
    id: '3', 
    company: 'Fabrikam Inc', 
    type: 'Basic', 
    startDate: '2023-01-01', 
    endDate: '2023-12-31', 
    status: 'expired' 
  },
]; 