import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import TeamPerformanceAgreements from './team_performance_agreements';
import TeamPerformanceAssessment from './team_performance_assessment';
const MyPerformanceAssessment: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Teams Performance Agreements':
        return <TeamPerformanceAgreements />;
      case 'Teams Performance Assessments':
        return <TeamPerformanceAssessment />;
      default:
        return null;
    }
  }

  return (
    <Box>
      {renderTabContent()}
    </Box>
  );
};

export default MyPerformanceAssessment; 
