import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../types';
import PerformanceAssessment from './my_assessment';
import TeamPerformance from './team_performance';
import MyPerformances from './my_overall_performance';
import ManagePerformanceAssessment from './manage_performance_assessment';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';
const MyPerformanceAssessment: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  return (
    <Box>
      {selectedTab === 'My Assessments' && (
        <PerformanceAssessment />
      )}
      {selectedTab === 'My Performances' && (
        <MyPerformances />
      )}
      {selectedTab === 'Team Performances' && (
        <TeamPerformance />
      )}
      {selectedTab === 'Manage Performance Assessment' && (
        <ManagePerformanceAssessment />
      )}
    </Box>
  );
};

export default MyPerformanceAssessment; 
