import React from 'react';
import { PageProps } from '../../types';
import { Routes, Route, Navigate } from 'react-router-dom';
import AnnualTargets from './annual_targets';
import QuarterlyTargetTable from './quarterly_targets';

const AnnualCorporateScorecard: React.FC<PageProps> = ({ title, icon, tabs }) => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/*" element={<Navigate to="quarterly-corporate-scorecards" replace />} />
        <Route path="quarterly-corporate-scorecards" element={<QuarterlyTargetTable />} />
        <Route path="annual-corporate-scorecards" element={<AnnualTargets />} />
      </Routes>
    </div>
  );
};

export default AnnualCorporateScorecard; 
