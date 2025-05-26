import React from 'react';
import { PageProps } from '../../types';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyPerformanceAgreements from './performance_agreement';
import ManagePerformanceAgreement from './manage_performance_agreement';

const MyPerformanceAgreement: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="my-performance-agreements" replace />} />
        <Route path="my-performance-agreements" element={<MyPerformanceAgreements />} />
        <Route path="manage-performance-agreement" element={<ManagePerformanceAgreement />} />
      </Routes>
    </div>
  );
};

export default MyPerformanceAgreement; 
