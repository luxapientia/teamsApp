import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { License, Company } from '../../types';
import { FormInput } from '../Form/FormInput';
import { FormSelect } from '../Form/FormSelect';
import { FormButtons } from '../Form/FormButtons';
import { Button } from '@fluentui/react-button';
import { KeyRegular } from '@fluentui/react-icons';

interface EditLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (license: Omit<License, '_id' | '__v' | 'status'>) => void;
  license?: License;
  selectedCompany: Company;
  companies: Company[];
}

export const EditLicenseModal: React.FC<EditLicenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  license,
  selectedCompany,
  companies,
}) => {
  const [formData, setFormData] = useState<Omit<License, '_id' | '__v' | 'status'>>({
    companyId: selectedCompany._id,
    licenseKey: '',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
  });
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    if (license) {
      setFormData({
        companyId: license.companyId,
        licenseKey: license.licenseKey,
        startDate: license.startDate,
        endDate: license.endDate,
      });
    }
    setDateError('');
  }, [license, selectedCompany]);

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

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    const segments_arr = [];
    
    for (let i = 0; i < segments; i++) {
      let segment = '';
      for (let j = 0; j < segmentLength; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments_arr.push(segment);
    }
    
    const licenseKey = segments_arr.join('-');
    handleChange('licenseKey')(licenseKey);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit License"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="license-key" className="block text-sm font-medium text-gray-700 mb-1">
            License Key
          </label>
          <div className="flex gap-2">
            <input
              id="license-key"
              type="text"
              value={formData.licenseKey}
              onChange={(e) => handleChange('licenseKey')(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              readOnly
            />
            <Button 
              icon={<KeyRegular />}
              onClick={generateLicenseKey}
              type="button"
              className="mt-1"
            >
              Generate
            </Button>
          </div>
        </div>
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
        <FormButtons 
          onCancel={onClose}
          mode="edit"
          submitLabel="License"
        />
      </form>
    </Modal>
  );
}; 