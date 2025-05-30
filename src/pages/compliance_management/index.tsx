import React from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../types';
import Champions from './champions';
import ComplianceAreas from './compliance_areas';
import ComplianceObligationPage from './obligation';
import ComplianceSetting from './compliance_setting';
import QuarterlyComplianceUpdates from './quarterly_updates';
import ComplianceReviews from './reviews';
import ComplianceReporting from './reporting';
import { Routes, Route, Navigate } from 'react-router-dom';

const ComplianceManagement: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <Box>
      <Routes>
        <Route path="/*" element={<Navigate to="compliance-reporting" replace />} />
        <Route path="compliance-champions" element={<Champions />} />
        <Route path="compliance-areas" element={<ComplianceAreas />} />
        <Route path="compliance-obligations" element={<ComplianceObligationPage />} />
        <Route path="compliance-setting" element={<ComplianceSetting />} />
        <Route path="quarterly-compliance-updates" element={<QuarterlyComplianceUpdates />} />
        <Route path="compliance-reviews" element={<ComplianceReviews />} />
        <Route path="compliance-reporting" element={<ComplianceReporting />} />
      </Routes>
    </Box>
  );
};

export default ComplianceManagement; 
