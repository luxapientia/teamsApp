import React, { useState } from 'react';
import { 
  ArrowSortRegular, 
  ArrowUpRegular, 
  ArrowDownRegular,
  EditRegular,
  DeleteRegular
} from '@fluentui/react-icons';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
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
    key: keyof T | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  const handleSort = (key: keyof T) => {
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

  const getSortedData = () => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue) return 0;

      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
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