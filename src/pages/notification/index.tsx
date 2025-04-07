import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { TargetTab, PageProps, AnnualTarget } from '../../types';
import QuarterlyTargetNotification from './quarterly_target';
// import OrganizationPerformances from './organization_performance';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createAnnualTarget, updateAnnualTarget, deleteAnnualTarget, fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import AddIcon from '@mui/icons-material/Add';
import PerformanceAssessmentNotification from './performance_assessment';
const NotificationPage: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  return (
    <Box>
      {selectedTab === "Quarterly Targets" ? (
        <QuarterlyTargetNotification />
      ) : (
        <PerformanceAssessmentNotification />
      )}
    </Box>
  );
};

export default NotificationPage; 
