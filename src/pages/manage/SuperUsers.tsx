import React, { useState, useEffect } from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { createSearchFilter } from '../../utils/search';
// Company type is used for typing the companies prop in SuperUserModal
import { SuperUser, Company } from '../../types';
import { SuperUserModal } from '../../components/Modal/AddSuperUserModal';
import { DeleteModal } from '../../components/Modal/DeleteModal';
import { superUserAPI, companyAPI } from '../../services/api';

// Extended SuperUser type to handle the populated companyId from API
interface SuperUserWithPopulatedCompany extends Omit<SuperUser, 'companyId'> {
  companyId: string | { _id: string; name: string } | null;
}

const SEARCH_FIELDS: (keyof SuperUser)[] = ['firstName', 'lastName', 'email', 'status', '_id'];

const SuperUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [superUsers, setSuperUsers] = useState<SuperUserWithPopulatedCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSuperUser, setSelectedSuperUser] = useState<SuperUserWithPopulatedCompany | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [superUsersResponse, companiesResponse] = await Promise.all([
          superUserAPI.getAll(),
          companyAPI.getAll()
        ]);
        console.log('Super Users Response:', superUsersResponse.data.data);
        setSuperUsers(superUsersResponse.data.data);
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

  const columns: Column<SuperUserWithPopulatedCompany>[] = [
    {
      key: 'firstName',
      header: 'First Name',
      sortable: true,
      width: 'w-[20%]',
    },
    {
      key: 'lastName',
      header: 'Last Name',
      sortable: true,
      width: 'w-[20%]',
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
        if (!superUser.companyId) {
          return '-';
        }

        if (typeof superUser.companyId === 'string') {
          const company = companies.find(c => c._id === superUser.companyId);
          return company?.name || '-';
        } else {
          return superUser.companyId?.name || '-';
        }
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: 'w-[10%]',
      render: (superUser) => <StatusBadge status={superUser.status} />,
    },
  ];

  const handleAdd = () => {
    setModalMode('add');
    setSelectedSuperUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (superUser: SuperUserWithPopulatedCompany) => {
    setSelectedSuperUser(superUser);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (superUser: SuperUserWithPopulatedCompany) => {
    setSelectedSuperUser(superUser);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSuperUser) {
      try {
        setError(null);
        await superUserAPI.delete(selectedSuperUser._id);
        setSuperUsers(superUsers.filter(user => user._id !== selectedSuperUser._id));
        setIsDeleteModalOpen(false);
        setSelectedSuperUser(undefined);
      } catch (error) {
        console.error('Error deleting super user:', error);
        setError('Failed to delete super user. Please try again later.');
      }
    }
  };

  const handleSubmit = async (superUserData: Omit<SuperUser, '_id' | '__v'>) => {
    try {
      setError(null);
      if (selectedSuperUser) {
        // Update existing super user
        const response = await superUserAPI.update(selectedSuperUser._id, superUserData);
        setSuperUsers(superUsers.map(user => 
          user._id === selectedSuperUser._id ? response.data.data : user
        ));
      } else {
        // Add new super user
        const response = await superUserAPI.create(superUserData);
        setSuperUsers([...superUsers, response.data.data]);
      }
      setIsModalOpen(false);
      setSelectedSuperUser(undefined);
    } catch (error) {
      console.error('Error saving super user:', error);
      throw error; // Re-throw the error to be handled by the modal
    }
  };

  const filteredSuperUsers = superUsers.filter(createSearchFilter(searchQuery, SEARCH_FIELDS) as any);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  // Convert populated companyId to string for the modal
  const prepareSuperUserForEdit = (superUser: SuperUserWithPopulatedCompany | undefined): SuperUser | undefined => {
    if (!superUser) return undefined;

    return {
      ...superUser,
      companyId: typeof superUser.companyId === 'string'
        ? superUser.companyId
        : superUser.companyId?._id || ''
    } as SuperUser;
  };

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
        user={prepareSuperUserForEdit(selectedSuperUser)}
        mode={modalMode}
        companies={companies.map(company => ({ _id: company._id, name: company.name }))}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSuperUser(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Super User"
        itemName={`${selectedSuperUser?.firstName} ${selectedSuperUser?.lastName}`}
      />
    </div>
  );
};

export default SuperUsers; 