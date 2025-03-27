import React, { useState } from 'react';
import { GridRegular, Search24Regular } from '@fluentui/react-icons';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import Contracting from './Contracting';

const AdminPanel: React.FC = () => {
  const [selectedSearchOption, setSelectedSearchOption] = useState<string>('contracting');

  const handleToggle = (key: string) => {
    setSelectedSearchOption(key);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-start items-center">
        <GridRegular className="w-4 h-4 me-2 text-blue-600" />
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
      </div>

      {/* Search Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1.5 text-sm rounded-full border ${selectedSearchOption === 'contracting'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-gray-200 text-gray-700 bg-gray-100'
              }`}
            onClick={() => handleToggle('contracting')}
          >
            Performance Contracting Periods
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-full border ${selectedSearchOption === 'assessments'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-gray-200 text-gray-700 bg-gray-100'
              }`}
            onClick={() => handleToggle('assessments')}
          >
            Performance Assessments Periods
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-full border ${selectedSearchOption === 'teams'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-gray-200 text-gray-700 bg-gray-100'
              }`}
            onClick={() => handleToggle('teams')}
          >
            Teams
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-full border ${selectedSearchOption === 'rating'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-gray-200 text-gray-700 bg-gray-100'
              }`}
            onClick={() => handleToggle('rating')}
          >
            Performance Rating Scale
          </button>
        </div>
      </div>

      {/* Conditional Rendering */}
      {selectedSearchOption === 'contracting' ? (
        <div>
          {/* Component for Performance Contracting Periods */}
          <Contracting />
        </div>
      ) : (
        <div>
          {/* Component for Performance Assessments Periods */}
          {/* ... existing code ... */}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;