import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SuperUser, Status } from '../../types';
import { FormInput } from '../Form/FormInput';
import { FormSelect } from '../Form/FormSelect';
import { FormButtons } from '../Form/FormButtons';
import { STATUS_OPTIONS } from '../../constants/formOptions';

interface AddSuperUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (superUser: Omit<SuperUser, '_id' | '__v'>) => Promise<void>;
  user?: SuperUser;
  mode: 'add' | 'edit';
  companies: { _id: string; name: string; }[];
}

export const SuperUserModal: React.FC<AddSuperUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
  companies,
}) => {
  const [formData, setFormData] = useState<Omit<SuperUser, '_id' | '__v'>>({
    firstName: '',
    lastName: '',
    email: '',
    companyId: '',
    status: 'active' as Status,
  });

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
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
    setError('');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (!formData.companyId) {
      setError('Please select a company');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      if (err.response?.data?.error?.errmsg?.includes('duplicate key error')) {
        setError('A super user with this email already exists.');
      } else {
        setError(err.response?.data?.message || 'Failed to save super user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user makes changes
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Super User' : 'Edit Super User'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <FormInput
          id="first-name"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          required
        />
        <FormInput
          id="last-name"
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
          options={companies.map(company => ({
            value: company._id,
            label: company.name,
          }))}
          required
          placeholder="Select a company..."
        />
        <FormSelect
          id="status"
          label="Status"
          value={formData.status}
          onChange={handleChange('status')}
          options={STATUS_OPTIONS}
          required
        />
        <FormButtons 
          onCancel={onClose}
          mode={mode}
          submitLabel="Super User"
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}; 