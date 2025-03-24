import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormInput } from '../Form/FormInput';
import { FormButtons } from '../Form/FormButtons';
import { License, LicenseStatus, Company } from '../../types';

interface EditLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (licenseData: Omit<License, 'id'>) => void;
  license?: License;
  companies: Company[];
  selectedCompany: Company;
  generateLicenseKey: (company: Company) => string;
}

export const EditLicenseModal: React.FC<EditLicenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  license,
  companies,
  selectedCompany,
  generateLicenseKey,
}) => {
  const [formData, setFormData] = useState<Omit<License, 'id'>>({
    companyId: selectedCompany.id,
    licenseKey: '',
    startDate: '',
    endDate: '',
    status: 'active',
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
      // For new licenses, set the company ID from selectedCompany
      setFormData(prev => ({
        ...prev,
        companyId: selectedCompany.id
      }));
    }
    setDateError('');
  }, [license, selectedCompany]);

  const handleChange = (field: keyof Omit<License, 'id'>) => (value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Validate dates when either date field changes
      if (field === 'startDate' || field === 'endDate') {
        if (newData.startDate && newData.endDate) {
          const start = new Date(newData.startDate);
          const end = new Date(newData.endDate);
          if (end < start) {
            setDateError('End date cannot be before start date');
          } else {
            setDateError('');
          }
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      
      if (end < start) {
        setDateError('End date cannot be before start date');
        return;
      }

      // Determine status based on end date
      const status: LicenseStatus = end < today ? 'expired' : 'active';

      // If editing an expired license or creating a new one, generate new key
      const shouldGenerateNewKey = !license || (license && license.status === 'expired');
      const licenseKey = shouldGenerateNewKey ? generateLicenseKey(selectedCompany) : formData.licenseKey;

      onSubmit({ 
        ...formData, 
        status,
        licenseKey,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit License">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="company"
          label="Company"
          value={selectedCompany.name}
          onChange={() => {}}
          disabled={true}
        />

        <FormInput
          id="startDate"
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={handleChange('startDate')}
          required
        />

        <div className="space-y-1">
          <FormInput
            id="endDate"
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={handleChange('endDate')}
            required
          />
          {dateError && (
            <p className="text-sm text-red-600">{dateError}</p>
          )}
        </div>

        <FormButtons
          onCancel={onClose}
          mode="edit"
          submitLabel="Update License"
        />
      </form>
    </Modal>
  );
}; 