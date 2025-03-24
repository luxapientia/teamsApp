import React from 'react';
import { ChevronDownRegular } from '@fluentui/react-icons';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="py-1">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownRegular className="absolute right-2 top-[13px] pointer-events-none text-gray-500" />
      </div>
    </div>
  );
}; 