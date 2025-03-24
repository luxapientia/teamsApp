import React from 'react';
import { Modal } from './Modal';
import { DeleteRegular } from '@fluentui/react-icons';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-center text-red-600">
          <DeleteRegular className="h-6 w-6 mr-2" />
          <p className="text-lg font-medium">Delete Confirmation</p>
        </div>
        <p className="text-gray-600">
          Are you sure you want to delete <span className="font-medium">{itemName}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}; 