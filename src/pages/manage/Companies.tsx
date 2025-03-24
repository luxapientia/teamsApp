import React, { useState } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { createSearchFilter } from '../../utils/search';
import { Company } from '../../types';
import { mockCompanies } from '../../mock/data';
import { CompanyModal } from '../../components/Modal/AddCompanyModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';

const SEARCH_FIELDS: (keyof Company)[] = ['name', 'description', 'status', 'id'];

const Companies: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();

  const columns: Column<Company>[] = [
    { key: 'name', header: 'Company Name', sortable: true },
    { key: 'description', header: 'Description', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (company) => <StatusBadge status={company.status} />,
    },
  ];

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCompany) {
      setCompanies(companies.filter(c => c.id !== selectedCompany.id));
    }
  };

  const handleSubmit = (companyData: Omit<Company, 'id'>) => {
    if (modalMode === 'add') {
      const newCompany: Company = {
        ...companyData,
        id: (companies.length + 1).toString(),
      };
      setCompanies([...companies, newCompany]);
    } else if (selectedCompany) {
      setCompanies(companies.map(company => 
        company.id === selectedCompany.id 
          ? { ...companyData, id: company.id }
          : company
      ));
    }
  };

  const handleAdd = () => {
    setSelectedCompany(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const filteredCompanies = companies.filter(createSearchFilter(searchQuery, SEARCH_FIELDS));

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