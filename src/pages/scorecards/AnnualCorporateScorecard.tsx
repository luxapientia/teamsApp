import React, { useState, useEffect } from 'react';
import { SearchRegular, AddRegular, PeopleTeamRegular } from '@fluentui/react-icons';
import { Table, type Column } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';

interface Scorecard {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  __v?: number;
}

const SEARCH_FIELDS: (keyof Scorecard)[] = ['title', 'status'];

const AnnualCorporateScorecard = () => {
  const [selectedTab, setSelectedTab] = useState('annual');
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScorecard, setSelectedScorecard] = useState<Scorecard | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setScorecards([]);
      } catch (error) {
        console.error('Error fetching scorecards:', error);
        setError('Failed to load scorecards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns: Column<Scorecard>[] = [
    {
      header: 'Annual Corporate Scorecard',
      key: 'title',
      sortable: true,
      render: (row: Scorecard) => row.title,
    },
    {
      header: 'Start Date',
      key: 'startDate',
      sortable: true,
      render: (row: Scorecard) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      header: 'End Date',
      key: 'endDate',
      sortable: true,
      render: (row: Scorecard) => new Date(row.endDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row: Scorecard) => <StatusBadge status={row.status} />,
    },
  ];

  const handleAdd = () => {
    setSelectedScorecard(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (scorecard: Scorecard) => {
    setSelectedScorecard(scorecard);
    setIsModalOpen(true);
  };

  const handleDelete = (scorecard: Scorecard) => {
    setSelectedScorecard(scorecard);
    setIsDeleteModalOpen(true);
  };

  const filteredScorecards = searchQuery
    ? scorecards.filter(scorecard =>
        SEARCH_FIELDS.some(field => {
          const value = scorecard[field];
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
        })
      )
    : scorecards;

  return (
    <div className="p-6 space-y-6">
      {/* Page Title - updated to match ManagePage style */}
      <div className="flex justify-start items-center">
        <PeopleTeamRegular className="w-4 h-4 me-2 text-blue-600" />
        <h1 className="text-2xl font-semibold">Annual Corporate Scorecards</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap text-sm font-medium text-center text-gray-500">
        <button
          className={`me-2 inline-block px-4 py-3 rounded-lg transition-colors ${
            selectedTab === 'quarterly'
              ? 'text-white bg-blue-600'
              : 'hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setSelectedTab('quarterly')}
        >
          Quarterly Targets
        </button>
        <button
          className={`me-2 inline-block px-4 py-3 rounded-lg transition-colors ${
            selectedTab === 'annual'
              ? 'text-white bg-blue-600'
              : 'hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setSelectedTab('annual')}
        >
          Annual Corporate Scorecards
        </button>
      </div>
      
      <div className='container'>
        {/* Search and Actions Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <div className="relative w-64">
            <SearchRegular className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search scorecards..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <AddRegular className="mr-2" />
            New
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
          {error ? (
            <div className="p-4 text-red-600">{error}</div>
          ) : (
            <Table
              columns={columns}
              data={filteredScorecards}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Add/Edit Modal will be implemented separately */}
        {/* Delete Modal will be implemented separately */}
      </div>
    </div>
  );
};

export default AnnualCorporateScorecard; 