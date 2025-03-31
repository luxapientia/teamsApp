import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { TargetTab, PageProps, AnnualTarget } from '../../types';
import PerformanceEvaluations from './performance_evaluations';
import OrganizationPerformances from './organization_performance';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createAnnualTarget, updateAnnualTarget, deleteAnnualTarget, fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import AddIcon from '@mui/icons-material/Add';
const OrganizationPerformance: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  return (
    <Box>
      {selectedTab === "Performance Evaluations" ? (
        <PerformanceEvaluations 
        />
      ) : (
        <OrganizationPerformances />
      )}
    </Box>
  );
};

export default OrganizationPerformance; 
