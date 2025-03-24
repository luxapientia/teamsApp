import React from 'react';
import { SearchRegular, AddRegular } from '@fluentui/react-icons';

interface TableHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  addButtonText?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onAdd,
  addButtonText
}) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
      <div className="relative w-64">
        <SearchRegular className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        />
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <AddRegular className="mr-2" />
          {addButtonText || `Add ${title}`}
        </button>
      )}
    </div>
  );
}; 