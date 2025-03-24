import { useState } from 'react';
import { createSearchFilter } from '../utils/search';

interface UseTableDataProps<T extends Record<string, any>> {
  initialData: T[];
  searchFields: (keyof T)[];
}

interface UseTableDataReturn<T extends Record<string, any>> {
  data: T[];
  filteredData: T[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleAdd: (newItem: T) => void;
  handleUpdate: (updatedItem: T, idField: keyof T) => void;
  handleDelete: (itemId: string | number, idField: keyof T) => void;
  handleBulkUpdate: (updatedItems: T[]) => void;
}

export function useTableData<T extends Record<string, any>>({ 
  initialData, 
  searchFields 
}: UseTableDataProps<T>): UseTableDataReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');

  const filterFn = createSearchFilter<T>(searchQuery, searchFields);
  const filteredData = data.filter(filterFn);

  const handleAdd = (newItem: T) => {
    setData([...data, newItem]);
  };

  const handleUpdate = (updatedItem: T, idField: keyof T) => {
    setData(data.map(item => 
      item[idField] === updatedItem[idField] ? updatedItem : item
    ));
  };

  const handleDelete = (itemId: string | number, idField: keyof T) => {
    setData(data.filter(item => item[idField] !== itemId));
  };

  const handleBulkUpdate = (updatedItems: T[]) => {
    setData(updatedItems);
  };

  return {
    data,
    filteredData,
    searchQuery,
    setSearchQuery,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleBulkUpdate
  };
} 