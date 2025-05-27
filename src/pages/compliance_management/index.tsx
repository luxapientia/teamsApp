import React from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../types';
import Champions from './champions';
import ComplianceAreas from './compliance_areas';
import { Routes, Route, Navigate } from 'react-router-dom';

const ComplianceManagement: React.FC<PageProps> = ({ title, icon, tabs }) => {

  return (
    <Box>
      <Routes>
        <Route path="/*" element={<Navigate to="compliance-champions" replace />} />
        <Route path="compliance-champions" element={<Champions />} />
        <Route path="compliance-areas" element={<ComplianceAreas />} />
      </Routes>
    </Box>
  );
};

export default ComplianceManagement; 
