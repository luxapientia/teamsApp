import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SuperUser, Status } from '../../types';
import { mockCompanies } from '../../mock/data';
import { ChevronDownRegular } from '@fluentui/react-icons';

interface SuperUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<SuperUser, 'id'>) => void;
  user?: SuperUser;
  mode: 'add' | 'edit';
}

export const SuperUserModal: React.FC<SuperUserModalProps> = ({ isOpen, onClose, onSubmit, user, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: mockCompanies[0]?.name || '',
    status: 'active' as Status,
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        company: user.company,
        status: user.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: mockCompanies[0]?.name || '',
        status: 'active',
      });
    }
  }, [user, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add New Super User' : 'Edit Super User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

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
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
            >
              <option value="active" className="py-1">Active</option>
              <option value="inactive" className="py-1">Inactive</option>
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
            {mode === 'add' ? 'Add Super User' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}; 