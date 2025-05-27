import React from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../types';
import Champions from './champions';
import { Routes, Route, Navigate } from 'react-router-dom';

const ComplianceManagement: React.FC<PageProps> = ({ title, icon, tabs }) => {

  return (
    <Box>
      <Routes>
        <Route path="/*" element={<Navigate to="compliance-champions" replace />} />
        <Route path="compliance-champions" element={<Champions />} />
      </Routes>
    </Box>
  );
};

export default ComplianceManagement; 
