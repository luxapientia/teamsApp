import React, { useState } from 'react';
import { 
  ArrowSortRegular, 
  ArrowUpRegular, 
  ArrowDownRegular,
  EditRegular,
  DeleteRegular
} from '@fluentui/react-icons';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
  sortValue?: (item: T) => string | number | Date | null;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: boolean;
}

export function Table<T extends Record<string, any>>({ columns, data, onEdit, onDelete, actions = true }: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  const compareValues = (a: any, b: any): number => {
    // Handle null/undefined values - always sort them to the end
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    // Handle strings (case-insensitive)
    if (typeof a === 'string' && typeof b === 'string') {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }

    // Convert to strings for any other type
    return String(a).toLowerCase().localeCompare(String(b).toLowerCase());
  };

  const getSortedData = () => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    const column = columns.find(col => col.key === sortConfig.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.sortValue ? column.sortValue(a) : a[sortConfig.key as keyof T];
      const bValue = column.sortValue ? column.sortValue(b) : b[sortConfig.key as keyof T];
      
      const result = compareValues(aValue, bValue);
      return sortConfig.direction === 'asc' ? result : -result;
    });
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    if (sortConfig.key !== column.key) {
      return <ArrowSortRegular className="ml-1" />;
    }
    
    return sortConfig.direction === 'asc' ? 
      <ArrowUpRegular className="ml-1" /> : 
      <ArrowDownRegular className="ml-1" />;
  };

  const sortedData = getSortedData();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.width ? column.width : ''
                } ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.header}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
            {actions && (onEdit || onDelete) && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                  {column.render
                    ? column.render(item)
                    : <div className="text-sm text-gray-900">{String(item[column.key])}</div>
                  }
                </td>
              ))}
              {actions && (onEdit || onDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                  <div className="flex items-center justify-center space-x-3">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                        title="Edit"
                      >
                        <EditRegular className="h-5 w-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="text-gray-600 hover:text-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <DeleteRegular className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 