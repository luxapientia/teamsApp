import { useState } from 'react';

interface UseModalReturn<T> {
  isOpen: boolean;
  selectedItem: T | undefined;
  modalMode: 'add' | 'edit';
  openAddModal: () => void;
  openEditModal: (item: T) => void;
  closeModal: () => void;
}

export function useModal<T>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | undefined>();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const openAddModal = () => {
    setSelectedItem(undefined);
    setModalMode('add');
    setIsOpen(true);
  };

  const openEditModal = (item: T) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedItem(undefined);
  };

  return {
    isOpen,
    selectedItem,
    modalMode,
    openAddModal,
    openEditModal,
    closeModal
  };
} 