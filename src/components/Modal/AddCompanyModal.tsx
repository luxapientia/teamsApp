import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Company, Status } from '../../types';
import { FormInput } from '../Form/FormInput';
import { FormSelect } from '../Form/FormSelect';
import { FormButtons } from '../Form/FormButtons';
import { STATUS_OPTIONS } from '../../constants/formOptions';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (company: Omit<Company, 'id'>) => void;
  company?: Company;
  mode: 'add' | 'edit';
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, onSubmit, company, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as Status,
    createdOn: new Date().toISOString(),
  });

  useEffect(() => {
    if (company && mode === 'edit') {
      setFormData({
        name: company.name,
        status: company.status,
        createdOn: company.createdOn,
      });
    } else {
      setFormData({
        name: '',
        status: 'active',
        createdOn: new Date().toISOString(),
      });
    }
  }, [company, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add New Company' : 'Edit Company'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="name"
          label="Company Name"
          value={formData.name}
          onChange={handleChange('name')}
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
          submitLabel="Company"
        />
      </form>
    </Modal>
  );
}; 