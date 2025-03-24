import React, { useState } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { createSearchFilter } from '../../utils/search';
import { SuperUser } from '../../types';
import { mockSuperUsers } from '../../mock/data';
import { SuperUserModal } from '../../components/Modal/AddSuperUserModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';

const SEARCH_FIELDS: (keyof SuperUser)[] = ['name', 'email', 'company', 'status', 'id'];

const SuperUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<SuperUser[]>(mockSuperUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<SuperUser | undefined>();

  const columns: Column<SuperUser>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'company', header: 'Company', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (user) => <StatusBadge status={user.status} />,
    },
  ];

  const handleEdit = (user: SuperUser) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (user: SuperUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
    }
  };

  const handleSubmit = (userData: Omit<SuperUser, 'id'>) => {
    if (modalMode === 'add') {
      const newUser: SuperUser = {
        ...userData,
        id: (users.length + 1).toString(),
      };
      setUsers([...users, newUser]);
    } else if (selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...userData, id: user.id }
          : user
      ));
    }
  };

  const handleAdd = () => {
    setSelectedUser(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(createSearchFilter(searchQuery, SEARCH_FIELDS));

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
        data={filteredUsers} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SuperUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(undefined);
        }}
        onSubmit={handleSubmit}
        user={selectedUser}
        mode={modalMode}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Super User"
        itemName={selectedUser?.name || ''}
      />
    </div>
  );
};

export default SuperUsers; 