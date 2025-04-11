import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../types';
import PerformanceAgreement from './performance_agreement';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import ManagePerformanceAgreement from './manage_performance_agreement';
const MyPerformanceAgreement: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  return (
    <Box>
      {selectedTab === 'Manage Performance Agreement' && <ManagePerformanceAgreement />}
      {selectedTab === 'My Quarterly Targets' && <PerformanceAgreement />}
    </Box>
  );
};

export default MyPerformanceAgreement; 
