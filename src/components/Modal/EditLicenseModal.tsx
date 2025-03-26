import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { License, Company, LicenseStatus } from '../../types';
import { FormInput } from '../Form/FormInput';
import { FormSelect } from '../Form/FormSelect';
import { FormButtons } from '../Form/FormButtons';
import { LICENSE_STATUS_OPTIONS } from '../../constants/formOptions';

interface EditLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (license: Omit<License, '_id' | '__v'>) => void;
  license?: License;
  selectedCompany: Company;
  companies: Company[];
  generateLicenseKey: () => string;
}

export const EditLicenseModal: React.FC<EditLicenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  license,
  selectedCompany,
  companies,
  generateLicenseKey,
}) => {
  const [formData, setFormData] = useState<Omit<License, '_id' | '__v'>>({
    companyId: selectedCompany._id,
    licenseKey: '',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    status: 'active' as LicenseStatus,
  });
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    if (license) {
      setFormData({
        companyId: license.companyId,
        licenseKey: license.licenseKey,
        startDate: license.startDate,
        endDate: license.endDate,
        status: license.status,
      });
    } else {
      // For new licenses, set default dates and company ID
      setFormData(prev => ({
        ...prev,
        companyId: selectedCompany._id,
        licenseKey: generateLicenseKey(),
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      }));
    }
    setDateError('');
  }, [license, selectedCompany, generateLicenseKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      setDateError('End date must be after start date');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'startDate' || field === 'endDate') {
      setDateError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={license ? 'Edit License' : 'Add New License'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="license-key"
          label="License Key"
          value={formData.licenseKey}
          onChange={handleChange('licenseKey')}
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
        />
        <FormInput
          id="start-date"
          label="Start Date"
          type="date"
          value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
          onChange={(value) => handleChange('startDate')(new Date(value).toISOString())}
          required
        />
        <FormInput
          id="end-date"
          label="End Date"
          type="date"
          value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
          onChange={(value) => handleChange('endDate')(new Date(value).toISOString())}
          required
        />
        {dateError && <div className="text-red-500 text-sm">{dateError}</div>}
        <FormSelect
          id="status"
          label="Status"
          value={formData.status}
          onChange={handleChange('status')}
          options={LICENSE_STATUS_OPTIONS}
          required
        />
        <FormButtons 
          onCancel={onClose}
          mode={license ? 'edit' : 'add'}
          submitLabel="License"
        />
      </form>
    </Modal>
  );
}; 