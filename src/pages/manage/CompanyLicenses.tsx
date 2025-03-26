import React, { useState, useEffect } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { createSearchFilter } from '../../utils/search';
import { License, Company } from '../../types';
import { EditLicenseModal } from '../../components/Modal/EditLicenseModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';
import { licenseAPI, companyAPI } from '../../services/api';

const SEARCH_FIELDS: (keyof License)[] = ['licenseKey', 'status', '_id'];

const CompanyLicenses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | undefined>();
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [licensesResponse, companiesResponse] = await Promise.all([
          licenseAPI.getAll(),
          companyAPI.getAll()
        ]);
        setLicenses(licensesResponse.data.data);
        setCompanies(companiesResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns: Column<License>[] = [
    {
      key: 'licenseKey',
      header: 'License Key',
      sortable: true,
      width: 'w-[25%]',
    },
    {
      key: 'companyId',
      header: 'Company',
      sortable: true,
      width: 'w-[25%]',
      render: (license) => {
        const company = companies.find(c => c._id === license.companyId);
        return company?.name || '-';
      },
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      width: 'w-[15%]',
      render: (license) => new Date(license.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      header: 'End Date',
      sortable: true,
      width: 'w-[15%]',
      render: (license) => new Date(license.endDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: 'w-[10%]',
      render: (license) => <StatusBadge status={license.status} />,
    },
  ];

  const handleAdd = () => {
    setSelectedLicense(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (license: License) => {
    const company = companies.find(c => c._id === license.companyId);
    if (company) {
      setSelectedCompany(company);
      setSelectedLicense(license);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (license: License) => {
    setSelectedLicense(license);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedLicense) {
      try {
        setError(null);
        await licenseAPI.delete(selectedLicense._id);
        setLicenses(licenses.filter(license => license._id !== selectedLicense._id));
        setIsDeleteModalOpen(false);
        setSelectedLicense(undefined);
      } catch (error) {
        console.error('Error deleting license:', error);
        setError('Failed to delete license. Please try again later.');
      }
    }
  };

  const handleSubmit = async (licenseData: Omit<License, '_id' | '__v'>) => {
    try {
      setError(null);
      if (selectedLicense) {
        // Update existing license
        const response = await licenseAPI.update(selectedLicense._id, licenseData);
        setLicenses(licenses.map(license => 
          license._id === selectedLicense._id ? response.data.data : license
        ));
      } else {
        // Add new license
        const response = await licenseAPI.create(licenseData);
        setLicenses([...licenses, response.data.data]);
      }
      setIsModalOpen(false);
      setSelectedLicense(undefined);
      setSelectedCompany(undefined);
    } catch (error) {
      console.error('Error saving license:', error);
      setError('Failed to save license. Please try again later.');
    }
  };

  const filteredLicenses = licenses.filter(createSearchFilter(searchQuery, SEARCH_FIELDS));

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
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <AddRegular className="mr-2" />
          Add License
        </button>
      </div>

      <Table 
        columns={columns} 
        data={filteredLicenses} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditLicenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLicense(undefined);
          setSelectedCompany(undefined);
        }}
        onSubmit={handleSubmit}
        license={selectedLicense}
        selectedCompany={selectedCompany || companies[0]}
        companies={companies}
        generateLicenseKey={() => Math.random().toString(36).substring(2, 15).toUpperCase()}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLicense(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete License"
        itemName={selectedLicense?.licenseKey || ''}
      />
    </div>
  );
};

export default CompanyLicenses; 