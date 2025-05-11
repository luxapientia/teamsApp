import React from 'react';
import { PageProps } from '../../types';
import PerformanceCalibrationTeam from './performance_calibration_team';
import { Box } from '@mui/material';
import PerformanceAgreements from './performance_agreements';
import PerformanceAssessments from './performance_assessments';

const PerformanceCalibration: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  return (
    <Box>
      {selectedTab === "Performance Calibration Team" && <PerformanceCalibrationTeam />}
      {selectedTab === "Performance Agreements" && <PerformanceAgreements />}
      {selectedTab === "Performance Assessments" && <PerformanceAssessments />}
    </Box>
  );
};

export default PerformanceCalibration;
