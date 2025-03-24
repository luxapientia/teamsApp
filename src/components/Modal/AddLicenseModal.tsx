import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { License, LicenseStatus } from '../../types';
import { mockCompanies } from '../../mock/data';
import { ChevronDownRegular } from '@fluentui/react-icons';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (license: Omit<License, 'id'>) => void;
  license?: License;
  mode: 'add' | 'edit';
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, onSubmit, license, mode }) => {
  const [formData, setFormData] = useState({
    company: mockCompanies[0]?.name || '',
    type: 'Basic',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: 'active' as LicenseStatus,
  });

  useEffect(() => {
    if (license && mode === 'edit') {
      setFormData({
        company: license.company,
        type: license.type,
        startDate: license.startDate,
        endDate: license.endDate,
        status: license.status,
      });
    } else {
      setFormData({
        company: mockCompanies[0]?.name || '',
        type: 'Basic',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'active',
      });
    }
  }, [license, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add New License' : 'Edit License'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <div className="relative">
            <select
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
              required
            >
              {mockCompanies.map((company) => (
                <option key={company.id} value={company.name} className="py-1">
                  {company.name}
                </option>
              ))}
            </select>
            <ChevronDownRegular className="absolute right-2 top-[13px] pointer-events-none text-gray-500" />
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            License Type
          </label>
          <div className="relative">
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="Basic" className="py-1">Basic</option>
              <option value="Professional" className="py-1">Professional</option>
              <option value="Enterprise" className="py-1">Enterprise</option>
            </select>
            <ChevronDownRegular className="absolute right-2 top-[13px] pointer-events-none text-gray-500" />
          </div>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LicenseStatus })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
            >
              <option value="active" className="py-1">Active</option>
              <option value="pending" className="py-1">Pending</option>
              <option value="expired" className="py-1">Expired</option>
            </select>
            <ChevronDownRegular className="absolute right-2 top-[13px] pointer-events-none text-gray-500" />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {mode === 'add' ? 'Add License' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}; 