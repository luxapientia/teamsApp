import React from 'react';

interface FormButtonsProps {
  onCancel: () => void;
  mode: 'add' | 'edit';
  submitLabel: string;
}

export const FormButtons: React.FC<FormButtonsProps> = ({
  onCancel,
  mode,
  submitLabel,
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {mode === 'add' ? `Add ${submitLabel}` : 'Save Changes'}
      </button>
    </div>
  );
}; 