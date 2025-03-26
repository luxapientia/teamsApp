import React, { useState, useEffect } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { createSearchFilter } from '../../utils/search';
import { Company } from '../../types';
import { CompanyModal } from '../../components/Modal/AddCompanyModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';
import { companyAPI, licenseAPI } from '../../services/api';

const SEARCH_FIELDS: (keyof Company)[] = ['name', 'status', '_id'];

const Companies: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const response = await companyAPI.getAll();
        setCompanies(response.data.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('Failed to load companies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      width: 'w-[60%]',
    },

    {
      key: 'createdOn',
      header: 'Created On',
      sortable: true,
      width: 'w-[15%]',
      render: (company) => new Date(company.createdOn).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: 'w-[15%]',
      render: (company) => <StatusBadge status={company.status} />,
    },
  ];

  const handleAdd = () => {
    setModalMode('add');
    setSelectedCompany(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCompany) {
      try {
        setError(null);
        await companyAPI.delete(selectedCompany._id);
        setCompanies(companies.filter(company => company._id !== selectedCompany._id));
        setIsDeleteModalOpen(false);
        setSelectedCompany(undefined);
      } catch (error) {
        console.error('Error deleting company:', error);
        setError('Failed to delete company. Please try again later.');
      }
    }
  };

  const handleSubmit = async (companyData: Omit<Company, '_id' | '__v'>) => {
    try {
      setError(null);
      if (selectedCompany) {
        // Update existing company
        const response = await companyAPI.update(selectedCompany._id, companyData);
        setCompanies(companies.map(company => 
          company._id === selectedCompany._id ? response.data.data : company
        ));
      } else {
        // Add new company
        const companyResponse = await companyAPI.create(companyData);
        const newCompany = companyResponse.data.data;
        setCompanies([...companies, newCompany]);

        // Create a default license for the new company
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        const licenseData = {
          companyId: newCompany._id,
          licenseKey: generateLicenseKey(), // You'll need to implement this function
          startDate: new Date().toISOString(),
          endDate: oneYearFromNow.toISOString(),
          status: 'active' as const
        };

        try {
          await licenseAPI.create(licenseData);
        } catch (licenseError) {
          console.error('Error creating default license:', licenseError);
          // We don't want to block company creation if license creation fails
          // but we should log it for monitoring
        }
      }
      setIsModalOpen(false);
      setSelectedCompany(undefined);
    } catch (error) {
      console.error('Error saving company:', error);
      setError('Failed to save company. Please try again later.');
    }
  };

  // Add helper function to generate license key
  const generateLicenseKey = () => {
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
  };

  const filteredCompanies = companies.filter(createSearchFilter(searchQuery, SEARCH_FIELDS));

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
            placeholder="Search companies..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <AddRegular className="mr-2" />
          Add Company
        </button>
      </div>

      <Table 
        columns={columns} 
        data={filteredCompanies} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCompany(undefined);
        }}
        onSubmit={handleSubmit}
        company={selectedCompany}
        mode={modalMode}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCompany(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        itemName={selectedCompany?.name || ''}
      />
    </div>
  );
};

export default Companies; 