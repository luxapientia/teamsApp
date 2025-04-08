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
  onSubmit: (company: Omit<Company, '_id' | '__v'>) => void;
  company?: Company;
  mode: 'add' | 'edit';
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, onSubmit, company, mode }) => {
  const [formData, setFormData] = useState<Omit<Company, '_id' | '__v'>>({
    name: '',
    status: 'active' as Status,
    createdOn: new Date().toISOString(),
    tenantId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (company && mode === 'edit') {
      setFormData({
        name: company.name,
        status: company.status,
        createdOn: company.createdOn,
        tenantId: company.tenantId,
      });
    } else {
      setFormData({
        name: '',
        status: 'active',
        createdOn: new Date().toISOString(),
        tenantId: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [company, mode]);

  const validateTenantId = (id: string): boolean => {
    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
      isValid = false;
    }

    if (!formData.tenantId.trim()) {
      newErrors.tenantId = 'Tenant ID is required';
      isValid = false;
    } else if (!validateTenantId(formData.tenantId)) {
      newErrors.tenantId = 'Tenant ID must be a valid UUID format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitting(true);
      setServerError(null);
      
      try {
        await onSubmit(formData);
      } catch (error: any) {
        console.error('Error submitting company data:', error);
        const errorMessage = error.response?.data?.message;
        
        if (errorMessage?.includes('Tenant ID already exists') || errorMessage?.includes('Tenant ID is already in use')) {
          setErrors(prev => ({ ...prev, tenantId: 'This Tenant ID is already in use by another company' }));
        } else if (errorMessage?.includes('Company name already exists')) {
          setErrors(prev => ({ ...prev, name: 'This Company name already exists' }));
        } else {
          setServerError(errorMessage || 'An error occurred while saving the company');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user makes changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear server error when any field changes
    if (serverError) {
      setServerError(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Company' : 'Edit Company'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 p-3 rounded border border-red-200 mb-3">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}
        
        <div>
          <FormInput
            id="company-name"
            label="Company Name"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <FormInput
            id="company-tenant-id"
            label="Tenant ID"
            value={formData.tenantId}
            onChange={handleChange('tenantId')}
            required
          />
          {errors.tenantId && <p className="mt-1 text-sm text-red-600">{errors.tenantId}</p>}
        </div>
        
        <FormSelect
          id="company-status"
          label="Status"
          value={formData.status}
          onChange={handleChange('status')}
          options={STATUS_OPTIONS}
          required
        />
        <FormInput
          id="company-created-on"
          label="Created On"
          type="date"
          value={new Date(formData.createdOn).toISOString().split('T')[0]}
          onChange={(value) => handleChange('createdOn')(new Date(value).toISOString())}
          required
        />
        <FormButtons 
          onCancel={onClose}
          mode={mode}
          submitLabel="Company"
          isSubmitting={submitting}
        />
      </form>
    </Modal>
  );
}; 