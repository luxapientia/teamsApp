import React from 'react';
import { PageProps } from '../../types';
import { Routes, Route, Navigate } from 'react-router-dom';
import PerformanceAssessment from './my_assessment';
import MyPerformances from './my_overall_performance';
import TeamPerformance from './team_performance';
import ManagePerformanceAssessment from './manage_performance_assessment';

const MyPerformanceAssessment: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="my-assessments" replace />} />
        <Route path="my-assessments" element={<PerformanceAssessment />} />
        <Route path="my-performances" element={<MyPerformances />} />
        <Route path="team-performances" element={<TeamPerformance />} />
        <Route path="manage-performance-assessment" element={<ManagePerformanceAssessment />} />
      </Routes>
    </div>
  );
};

export default MyPerformanceAssessment; 
