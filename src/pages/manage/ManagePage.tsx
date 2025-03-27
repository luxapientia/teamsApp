import React, { useState } from 'react';
import { GridRegular } from '@fluentui/react-icons';
import Companies from './Companies';
import SuperUsers from './SuperUsers';
import CompanyLicenses from './CompanyLicenses';
import { PageProps } from '../../types/page';

const ManagePage: React.FC<PageProps> = (props) => {
  const [activeTab, setActiveTab] = useState('companies');

  const tabs = [
    { id: 'companies', label: 'Companies', component: <Companies /> },
    { id: 'super-users', label: 'Companies Super Users', component: <SuperUsers /> },
    { id: 'licenses', label: 'Companies Licenses', component: <CompanyLicenses /> }
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component || tabs[0].component;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-start items-center">
        <GridRegular className="w-4 h-4 me-2 text-blue-600" />
        <h1 className="text-2xl font-semibold">Manage Companies</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap text-sm font-medium text-center text-gray-500">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`me-2 inline-block px-4 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-white bg-blue-600'
                : 'hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="container">
        {activeComponent}
      </div>
    </div>
  );
};

export default ManagePage; 