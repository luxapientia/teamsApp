import React from 'react';
import Companies from './Companies';
import SuperUsers from './SuperUsers';
import CompanyLicenses from './CompanyLicenses';
import { PageProps } from '../../types/page';
import Modules from './Modules';
import { Routes, Route, Navigate } from 'react-router-dom';

const ManagePage: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="p-6 space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="companies" replace />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies-super-users" element={<SuperUsers />} />
        <Route path="companies-licenses" element={<CompanyLicenses />} />
        <Route path="modules" element={<Modules />} />
      </Routes>
    </div>
  );
};

export default ManagePage; 