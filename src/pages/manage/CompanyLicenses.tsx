import React, { useState, useEffect } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { Company, License } from '../../types';
import { EditLicenseModal } from '../../components/Modal/EditLicenseModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';
import { companyAPI, licenseAPI } from '../../services/api';
import { Button } from "@fluentui/react-button";

interface CompanyWithLicense extends Company {
  license?: License;
}

const SEARCH_FIELDS = ['name', 'status', '_id', 'license.licenseKey', 'license.status'] as const;

const CompanyLicenses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithLicense | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [companiesResponse, licensesResponse] = await Promise.all([
          companyAPI.getAll(),
          licenseAPI.getAll(),
        ]);
        
        console.log(companiesResponse, licensesResponse)
        const companiesData = companiesResponse.data.data || [];
        const licensesData = licensesResponse.data.data || [];
        
        // Filter out licenses for non-existent companies
        const validLicenses = licensesData.filter(license => 
          companiesData.some(company => company._id === license.companyId)
        );
        
        // If there are orphaned licenses, clean them up
        if (validLicenses.length !== licensesData.length) {
          const orphanedLicenses = licensesData.filter(license => 
            !companiesData.some(company => company._id === license.companyId)
          );
          
          // Delete orphaned licenses
          for (const license of orphanedLicenses) {
            try {
              await licenseAPI.delete(license._id);
              console.log(`Deleted orphaned license for company ${license.companyId}`);
            } catch (error) {
              console.error(`Failed to delete orphaned license ${license._id}:`, error);
            }
          }
        }
        
        setCompanies(companiesData);
        setLicenses(validLicenses);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine companies with their licenses
  const companiesWithLicenses: CompanyWithLicense[] = companies.map(company => {
    const license = licenses.find(license => license.companyId === company._id);
    return {
      ...company,
      license,
    };
  });

  const columns: Column<CompanyWithLicense>[] = [
    {
      key: 'name',
      header: 'Company',
      sortable: true,
      width: 'w-[25%]',
    },
    {
      key: 'license.licenseKey',
      header: 'License Key',
      sortable: true,
      width: 'w-[25%]',
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.license?.licenseKey || 'No License'}
        </div>
      ),
    },
    {
      key: 'license.startDate',
      header: 'Start Date',
      sortable: true,
      width: 'w-[15%]',
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.license?.startDate ? new Date(item.license.startDate).toLocaleDateString() : '-'}
        </div>
      ),
    },
    {
      key: 'license.endDate',
      header: 'End Date',
      sortable: true,
      width: 'w-[15%]',
      render: (item) => (
        <div className="text-sm text-gray-900">
          {item.license?.endDate ? new Date(item.license.endDate).toLocaleDateString() : '-'}
        </div>
      ),
    },
    {
      key: 'license.status',
      header: 'License Status',
      sortable: true,
      width: 'w-[20%]',
      render: (item) => item.license ? <StatusBadge status={item.license.status} /> : <StatusBadge status="inactive" />,
    },
  ];

  const handleAdd = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleEdit = (companyWithLicense: CompanyWithLicense) => {
    setSelectedCompany(companyWithLicense);
    setIsModalOpen(true);
  };

  const handleDelete = (companyWithLicense: CompanyWithLicense) => {
    setSelectedCompany(companyWithLicense);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCompany?.license) {
      try {
        setError(null);
        await licenseAPI.delete(selectedCompany.license._id);
        setLicenses(licenses.filter(license => license._id !== selectedCompany.license?._id));
        setIsDeleteModalOpen(false);
        setSelectedCompany(undefined);
      } catch (error) {
        console.error('Error deleting license:', error);
        setError('Failed to delete license. Please try again later.');
      }
    }
  };

  const handleSubmit = async (licenseData: Omit<License, '_id' | '__v'>) => {
    try {
      setError(null);
      console.log('License Data:', licenseData);
      console.log('Selected Company:', selectedCompany);
      
      if (!selectedCompany) {
        throw new Error('No company selected');
      }

      // Check if company already has a license
      const existingLicense = licenses.find(license => license.companyId === selectedCompany._id);
      
      if (existingLicense) {
        // Update existing license
        console.log('Updating existing license...');
        const response = await licenseAPI.update(existingLicense._id, licenseData);
        console.log('Update response:', response);
        
        // Update the licenses state
        setLicenses(licenses.map(license => 
          license._id === existingLicense._id ? response.data.data : license
        ));
      } else {
        // Add new license
        console.log('Creating new license...');
        const newLicenseData = {
          ...licenseData,
          companyId: selectedCompany._id,
          status: licenseData.status || 'active',
          startDate: licenseData.startDate || new Date().toISOString(),
          endDate: licenseData.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        };
        console.log('New license data:', newLicenseData);
        const response = await licenseAPI.create(newLicenseData);
        console.log('Create response:', response);
        
        // Update the licenses state with the new license
        const newLicense = response.data.data;
        setLicenses([...licenses, newLicense]);
      }
      
      setIsModalOpen(false);
      setSelectedCompany(undefined);
    } catch (error: any) {
      console.error('Error saving license:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save license. Please try again later.');
    }
  };

  console.log(companiesWithLicenses, 'withLicenses');
  const filteredCompanies = companiesWithLicenses.filter(company => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return SEARCH_FIELDS.some(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentValue = company[parent as keyof CompanyWithLicense];
        if (parent === 'license' && parentValue && typeof parentValue === 'object') {
          return (parentValue as License)[child as keyof License]?.toString().toLowerCase().includes(searchLower);
        }
        return false;
      }
      return company[field as keyof CompanyWithLicense]?.toString().toLowerCase().includes(searchLower);
    });
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="relative w-64">
          <SearchRegular className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search licenses..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button icon={<AddRegular />} onClick={() => handleAdd(companies[0])}>Add License</Button>
      </div>

      <Table 
        columns={columns} 
        data={filteredCompanies}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {selectedCompany && (
        <EditLicenseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCompany(undefined);
          }}
          onSubmit={handleSubmit}
          license={selectedCompany.license}
          selectedCompany={selectedCompany}
          companies={companies}
          generateLicenseKey={() => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const segments = 4;
            const segmentLength = 4;
            const segments_arr = [];
            
            for (let i = 0; i < segments; i++) {
              let segment = '';
              for (let j = 0; j < segmentLength; j++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              segments_arr.push(segment);
            }
            
            return segments_arr.join('-');
          }}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCompany(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete License"
        itemName={`license for ${selectedCompany?.name || ''}`}
      />
    </div>
  );
};

export default CompanyLicenses; 