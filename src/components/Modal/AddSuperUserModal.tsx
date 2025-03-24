import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SuperUser, Status } from '../../types';
import { FormInput } from '../Form/FormInput';
import { FormSelect } from '../Form/FormSelect';
import { FormButtons } from '../Form/FormButtons';
import { STATUS_OPTIONS } from '../../constants/formOptions';

interface SuperUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<SuperUser, 'id'>) => void;
  user?: SuperUser;
  mode: 'add' | 'edit';
  companies: { id: string; name: string }[];
}

export const SuperUserModal: React.FC<SuperUserModalProps> = ({ isOpen, onClose, onSubmit, user, mode, companies }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyId: '',
    status: 'active' as Status,
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId: user.companyId,
        status: user.status,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        companyId: '',
        status: 'active',
      });
    }
  }, [user, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add New Super User' : 'Edit Super User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          required
        />

        <FormInput
          id="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          required
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          required
        />

        <FormSelect
          id="company"
          label="Company"
          value={formData.companyId}
          onChange={handleChange('companyId')}
          options={companyOptions}
          required
        />

        <FormSelect
          id="status"
          label="Status"
          value={formData.status}
          onChange={handleChange('status')}
          options={STATUS_OPTIONS}
        />

        <FormButtons
          onCancel={onClose}
          mode={mode}
          submitLabel="Super User"
        />
      </form>
    </Modal>
  );
}; 