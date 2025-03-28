import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { TargetTab, PageProps, AnnualTarget } from '../../types';
import AnnualTargets from './annual_targets';
import AddAnnualTargetModal from './annual_targets/AddAnnualTargetModal';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createAnnualTarget, updateAnnualTarget, deleteAnnualTarget } from '../../store/slices/scorecardSlice';
import AddIcon from '@mui/icons-material/Add';
import QuarterlyTargetTable from './quarterly_targets';

const AnnualCorporateScorecard: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  // const dispatch = useAppDispatch();
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editingTarget, setEditingTarget] = useState<AnnualTarget | null>(null);

  // const handleAddTarget = (target: Omit<AnnualTarget, 'id'>) => {
  //   dispatch(createAnnualTarget(target));
  //   setIsModalOpen(false);
  // };

  // const handleEditTarget = (target: AnnualTarget) => {
  //   setEditingTarget(target);
  //   setIsModalOpen(true);
  // };

  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   setEditingTarget(null);
  // };

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
