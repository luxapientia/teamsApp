import React from 'react';
import { PageProps } from '../../types';
import { Routes, Route, Navigate } from 'react-router-dom';
import PerformanceCalibrationTeam from './performance_calibration_team';
import PerformanceAgreements from './performance_agreements';
import PerformanceAssessments from './performance_assessments';

const PerformanceCalibration: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="performance-calibration-team" replace />} />
        <Route path="performance-calibration-team" element={<PerformanceCalibrationTeam />} />
        <Route path="performance-agreements" element={<PerformanceAgreements />} />
        <Route path="performance-assessments" element={<PerformanceAssessments />} />
      </Routes>
    </div>
  );
};

export default PerformanceCalibration;
