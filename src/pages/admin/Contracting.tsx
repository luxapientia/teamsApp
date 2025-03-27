import React, { useState } from 'react';

import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Calendar24Regular } from '@fluentui/react-icons';

const Contracting: React.FC = () => {
  const [selectedScorecard, setSelectedScorecard] = useState<string | undefined>();
  const [selectedQuarter, setSelectedQuarter] = useState<string | undefined>();
  const [showDateInputs, setShowDateInputs] = useState<boolean>(false);
  const [scorecardError, setScorecardError] = useState<string>('');
  const [quarterError, setQuarterError] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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
    let hasError = false;

    if (!selectedScorecard) {
      setScorecardError('Please select an Annual Corporate Scorecard.');
      hasError = true;
    } else {
      setScorecardError('');
    }

    if (!selectedQuarter) {
      setQuarterError('Please select a Quarter.');
      hasError = true;
    } else {
      setQuarterError('');
    }

    if (!hasError) {
      setShowDateInputs(true);
    }
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
        {scorecardError && <p className="text-red-500 text-sm">{scorecardError}</p>}
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
            className="bg-blue-500 hover:bg-blue-600 rounded-full shadow-md text-white"
            onClick={handleViewClick}
          />
        </div>
        {quarterError && <p className="text-red-500 text-sm">{quarterError}</p>}
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
                value={startDate}
                onSelectDate={(date) => {
                  setStartDate(date || undefined);
                }}
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
                value={endDate}
                onSelectDate={(date) => {
                  setEndDate(date || undefined);
                }}
              />
              <Calendar24Regular className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {startDate && endDate && startDate >= endDate && <p className="text-red-500 text-sm">End Date must be greater than Start Date.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Contracting;