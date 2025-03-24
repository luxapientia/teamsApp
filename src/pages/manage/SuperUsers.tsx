import React, { useState } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { createSearchFilter } from '../../utils/search';
import { SuperUser, Company } from '../../types';
import { mockSuperUsers, mockCompanies } from '../../mock/data';
import { SuperUserModal } from '../../components/Modal/AddSuperUserModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';

const SEARCH_FIELDS: (keyof SuperUser)[] = ['firstName', 'lastName', 'email', 'status', 'id'];

const SuperUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [superUsers, setSuperUsers] = useState<SuperUser[]>(mockSuperUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSuperUser, setSelectedSuperUser] = useState<SuperUser | undefined>();

  const columns: Column<SuperUser>[] = [
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      width: 'w-[25%]',
      render: (superUser) => `${superUser.firstName} ${superUser.lastName}`,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      width: 'w-[25%]',
    },
    {
      key: 'companyId',
      header: 'Company',
      sortable: true,
      width: 'w-[25%]',
      render: (superUser) => {
        const company = mockCompanies.find(c => c.id === superUser.companyId);
        return company?.name || '-';
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: 'w-[15%]',
      render: (superUser) => <StatusBadge status={superUser.status} />,
    },
  ];

  const handleAdd = () => {
    setModalMode('add');
    setSelectedSuperUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (superUser: SuperUser) => {
    setSelectedSuperUser(superUser);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (superUser: SuperUser) => {
    setSelectedSuperUser(superUser);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSuperUser) {
      setSuperUsers(superUsers.filter(user => user.id !== selectedSuperUser.id));
      setIsDeleteModalOpen(false);
      setSelectedSuperUser(undefined);
    }
  };

  const handleSubmit = (superUserData: Omit<SuperUser, 'id'>) => {
    if (selectedSuperUser) {
      // Update existing super user
      setSuperUsers(superUsers.map(user => 
        user.id === selectedSuperUser.id 
          ? { ...superUserData, id: user.id } 
          : user
      ));
    } else {
      // Add new super user
      const newSuperUser: SuperUser = {
        ...superUserData,
        id: (superUsers.length + 1).toString(),
      };
      setSuperUsers([...superUsers, newSuperUser]);
    }
    setIsModalOpen(false);
    setSelectedSuperUser(undefined);
  };

  const filteredSuperUsers = superUsers.filter(createSearchFilter(searchQuery, SEARCH_FIELDS));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="relative w-64">
          <SearchRegular className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search super users..."
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
          Add Super User
        </button>
      </div>

      <Table 
        columns={columns} 
        data={filteredSuperUsers} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SuperUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSuperUser(undefined);
        }}
        onSubmit={handleSubmit}
        user={selectedSuperUser}
        mode={modalMode}
        companies={mockCompanies}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSuperUser(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Super User"
        itemName={selectedSuperUser ? `${selectedSuperUser.firstName} ${selectedSuperUser.lastName}` : ''}
      />
    </div>
  );
};

export default SuperUsers; 