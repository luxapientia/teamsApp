import React from 'react';

interface FormButtonsProps {
  onCancel: () => void;
  mode: 'add' | 'edit';
  submitLabel: string;
  isSubmitting?: boolean;
}

export const FormButtons: React.FC<FormButtonsProps> = ({
  onCancel,
  mode,
  submitLabel,
  isSubmitting = false,
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting 
          ? 'Saving...' 
          : mode === 'add' 
            ? `Add ${submitLabel}` 
            : 'Save Changes'
        }
      </button>
    </div>
  );
}; 