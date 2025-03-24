import React, { useState } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { License } from '../../types';
import { mockLicenses } from '../../mock/data';
import { LicenseModal } from '../../components/Modal/AddLicenseModal';
import { createSearchFilter } from '../../utils/search';

const SEARCH_FIELDS: (keyof License)[] = ['company', 'type', 'status'];

const CompanyLicenses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [licenses, setLicenses] = useState<License[]>(mockLicenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedLicense, setSelectedLicense] = useState<License | undefined>();

  const columns: Column<License>[] = [
    { key: 'company', header: 'Company', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'startDate', header: 'Start Date', sortable: true },
    { key: 'endDate', header: 'End Date', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (license) => <StatusBadge status={license.status} />,
    },
  ];

  const handleEdit = (license: License) => {
    setSelectedLicense(license);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (license: License) => {
    if (window.confirm('Are you sure you want to delete this license?')) {
      setLicenses(licenses.filter((l) => l.id !== license.id));
    }
  };

  const handleSubmit = (licenseData: Omit<License, 'id'>) => {
    if (modalMode === 'add') {
      const newLicense: License = {
        ...licenseData,
        id: `license-${licenses.length + 1}`,
      };
      setLicenses([...licenses, newLicense]);
    } else if (selectedLicense) {
      setLicenses(
        licenses.map((license) =>
          license.id === selectedLicense.id
            ? { ...licenseData, id: license.id }
            : license
        )
      );
    }
  };

  const handleAdd = () => {
    setSelectedLicense(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const filteredLicenses = licenses.filter(createSearchFilter(searchQuery, SEARCH_FIELDS));

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

      <LicenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLicense(undefined);
        }}
        onSubmit={handleSubmit}
        license={selectedLicense}
        mode={modalMode}
      />
    </div>
  );
};

export default CompanyLicenses; 