import React from 'react';
import { PageProps } from '../../types';
import { Routes, Route, Navigate } from 'react-router-dom';
import TeamPerformanceAgreements from './team_performance_agreements';
import TeamPerformanceAssessment from './team_performance_assessment';
import TeamPerformances from './team_performances';
import TeamPerformanceAgreementsCompletions from './team_performance_agreements_completions';
import TeamPerformanceAssessmentsCompletions from './team_performance_assessments_completions';
import PerformanceDistributionReport from './performance_distribution_report';
import EmployeePerformanceRating from './employee_performance_rating/index';
import SupervisorPerformanceDistributionReport from './supervisor_performance_distribution_report/index';

const Reports: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="teams-performances" replace />} />
        <Route path="teams-performances" element={<TeamPerformances />} />
        <Route path="teams-performance-agreements" element={<TeamPerformanceAgreements />} />
        <Route path="teams-performance-assessments" element={<TeamPerformanceAssessment />} />
        <Route path="teams-performance-agreements-completions" element={<TeamPerformanceAgreementsCompletions />} />
        <Route path="teams-performance-assessments-completions" element={<TeamPerformanceAssessmentsCompletions />} />
        <Route path="performance-distribution-report" element={<PerformanceDistributionReport />} />
        <Route path="employee-performance-rating" element={<EmployeePerformanceRating />} />
        <Route path="supervisor-performance-distribution-report" element={<SupervisorPerformanceDistributionReport />} />
      </Routes>
    </div>
  );
};

export default Reports; 
