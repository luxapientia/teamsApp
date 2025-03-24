import React, { useState, useEffect } from 'react';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { startDailyLicenseCheck } from '../../utils/licenseManager';
import { License, Company } from '../../types';
import { mockCompanies, mockLicenses } from '../../mock/data';
import { EditLicenseModal } from '../../components/Modal/EditLicenseModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';
import { useTableData } from '../../hooks/useTableData';
import { useModal } from '../../hooks/useModal';
import { TableHeader } from '../../components/TableHeader';

const SEARCH_FIELDS: (keyof License)[] = ['companyId', 'licenseKey', 'status'];

const CompanyLicenses: React.FC = () => {
  const { 
    data: licenses, 
    filteredData: filteredLicenses,
    searchQuery,
    setSearchQuery,
    handleUpdate: updateLicense,
    handleBulkUpdate: updateLicenses
  } = useTableData<License>({ 
    initialData: mockLicenses,
    searchFields: SEARCH_FIELDS
  });

  const { data: companies } = useTableData<Company>({ 
    initialData: mockCompanies,
    searchFields: ['name', 'status']
  });

  const { isOpen, selectedItem, openEditModal, closeModal } = useModal<License>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();

  useEffect(() => {
    const cleanup = startDailyLicenseCheck(licenses, updateLicenses);
    return cleanup;
  }, [licenses, updateLicenses]);

  const generateLicenseKey = (company: Company) => {
    const prefix = company.name.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${randomNum}`;
  };

  const handleEditLicense = (license: License) => {
    const company = companies.find(c => c.id === license.companyId);
    if (company) {
      setSelectedCompany(company);
      openEditModal(license);
    }
  };

  const handleSubmit = (licenseData: Omit<License, 'id'>) => {
    if (selectedItem) {
      updateLicense({ ...licenseData, id: selectedItem.id }, 'id');
    }
    closeModal();
    setSelectedCompany(undefined);
  };

  const columns: Column<License>[] = [
    {
      key: 'companyName',
      header: 'Company',
      sortable: true,
      width: 'w-[30%]',
      sortValue: (license: License) => {
        const company = companies.find(c => c.id === license.companyId);
        return company?.name.toLowerCase() || 'Unknown Company';
      },
      render: (license: License) => {
        const company = companies.find(c => c.id === license.companyId);
        return company?.name || 'Unknown Company';
      }
    },
    {
      key: 'licenseKey',
      header: 'License Key',
      sortable: true,
      width: 'w-[30%]',
      render: (license: License) => license.licenseKey || '-'
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      width: 'w-[15%]',
      render: (license: License) => new Date(license.startDate).toLocaleDateString(),
      sortValue: (license: License) => new Date(license.startDate).getTime()
    },
    {
      key: 'endDate',
      header: 'End Date',
      sortable: true,
      width: 'w-[15%]',
      render: (license: License) => new Date(license.endDate).toLocaleDateString(),
      sortValue: (license: License) => new Date(license.endDate).getTime()
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: 'w-[10%]',
      render: (license: License) => <StatusBadge status={license.status} />,
      sortValue: (license: License) => {
        switch (license.status) {
          case 'active': return 'a';
          case 'pending': return 'b';
          case 'expired': return 'c';
          default: return 'd';
        }
      }
    }
  ];

  const handleDelete = (license: License) => {
    const company = companies.find(c => c.id === license.companyId);
    if (company) {
      setSelectedCompany(company);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedCompany) {
      const updatedLicenses = licenses.filter(l => l.companyId !== selectedCompany.id);
      updateLicenses(updatedLicenses);
      setIsDeleteModalOpen(false);
      setSelectedCompany(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <TableHeader
        title="Licenses"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Table 
        columns={columns} 
        data={filteredLicenses} 
        onEdit={handleEditLicense}
        onDelete={handleDelete}
      />

      {isOpen && selectedItem && selectedCompany && (
        <EditLicenseModal
          isOpen={isOpen}
          onClose={() => {
            closeModal();
            setSelectedCompany(undefined);
          }}
          onSubmit={handleSubmit}
          license={selectedItem}
          companies={companies}
          selectedCompany={selectedCompany}
          generateLicenseKey={generateLicenseKey}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCompany(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Company License"
        itemName={selectedCompany?.name || ''}
      />
    </div>
  );
};

export default CompanyLicenses; 