import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { TargetTab, PageProps, AnnualTarget } from '../../types';
import AnnualTargets from './annual_targets';
import AddAnnualTargetModal from './annual_targets/AddAnnualTargetModal';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createAnnualTarget, updateAnnualTarget, deleteAnnualTarget, fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import AddIcon from '@mui/icons-material/Add';
import QuarterlyTargetTable from './quarterly_targets';

const AnnualCorporateScorecard: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  return (
    <Box>
      

      {selectedTab === TargetTab.Annual ? (
        <AnnualTargets 
          // onEdit={handleEditTarget}
        />
      ) : (
        <QuarterlyTargetTable />
      )}

      {/* <AddAnnualTargetModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddTarget}
        editingTarget={editingTarget}
      /> */}
    </Box>
  );
};

export default AnnualCorporateScorecard; 
