import React, { useState } from 'react';

import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Calendar24Regular } from '@fluentui/react-icons';

const Contracting: React.FC = () => {
  const [selectedScorecard, setSelectedScorecard] = useState<string | undefined>();
  const [selectedQuarter, setSelectedQuarter] = useState<string | undefined>();
  const [showDateInputs, setShowDateInputs] = useState<boolean>(false);

  const scorecardOptions = [
    { key: '2025-2026', text: 'Annual Corporate Scorecard 2025 - 2026' },
    // Add more options as needed
  ];

  const quarterOptions = [
    { key: 'Q1', text: 'Q1' },
    { key: 'Q2', text: 'Q2' },
    { key: 'Q3', text: 'Q3' },
    { key: 'Q4', text: 'Q4' },
  ];

  const handleViewClick = () => {
    setShowDateInputs(true);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Annual Corporate Scorecard
        </label>
        <Dropdown
          placeholder="Select Scorecard"
          options={scorecardOptions}
          selectedKey={selectedScorecard}
          onChange={(_, option) => setSelectedScorecard(option?.key as string)}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Quarter
        </label>
        <div className="flex gap-4 items-end">
          <Dropdown
            placeholder="Select Quarter"
            options={quarterOptions}
            selectedKey={selectedQuarter}
            onChange={(_, option) => setSelectedQuarter(option?.key as string)}
            className="w-48"
          />
          <PrimaryButton
            text="View"
            className="bg-blue-600 hover:bg-blue-700 rounded-full"
            onClick={handleViewClick}
          />
        </div>
      </div>

      {showDateInputs && (
        <>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="relative">
              <DatePicker
                placeholder="Select a date..."
                ariaLabel="Select a date"
                className="w-full"
              />
              <Calendar24Regular className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="relative">
              <DatePicker
                placeholder="Select a date..."
                ariaLabel="Select a date"
                className="w-full"
              />
              <Calendar24Regular className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Contracting; 