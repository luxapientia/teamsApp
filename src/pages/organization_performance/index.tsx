import React from 'react';
import { PageProps } from '../../types';
import { Routes, Route, Navigate } from 'react-router-dom';
import PerformanceEvaluations from './performance_evaluations';
import OrganizationPerformances from './organization_performance';

const OrganizationPerformance: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="organization-performance-assessment" replace />} />
        <Route path="organization-performance-assessment" element={<PerformanceEvaluations />} />
        <Route path="annual-organization-performance" element={<OrganizationPerformances />} />
      </Routes>
    </div>
  );
};

export default OrganizationPerformance; 
