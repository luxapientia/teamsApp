import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { TargetTab, PageProps, AnnualTarget } from '../../types';
import AnnualTargetTable from './components/annual_targets/AnnualTargetTable';
import AddAnnualTargetModal from './components/annual_targets/AddAnnualTargetModal';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createAnnualTarget, updateAnnualTarget, deleteAnnualTarget } from '../../store/slices/scorecardSlice';
import AddIcon from '@mui/icons-material/Add';

const AnnualCorporateScorecard: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<AnnualTarget | null>(null);

  const handleAddTarget = (target: Omit<AnnualTarget, 'id'>) => {
    dispatch(createAnnualTarget(target));
    setIsModalOpen(false);
  };

  const handleEditTarget = (target: AnnualTarget) => {
    setEditingTarget(target);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTarget(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{
            textTransform: 'none',
            borderColor: '#E5E7EB',
            color: '#374151',
            '&:hover': {
              borderColor: '#D1D5DB',
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          New
        </Button>
      </Box>

      {selectedTab === TargetTab.Annual ? (
        <AnnualTargetTable 
          onEdit={handleEditTarget}
        />
      ) : (
        <div>
          <h1>Quarterly Target Table</h1>
        </div>
      )}

      <AddAnnualTargetModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddTarget}
        editingTarget={editingTarget}
      />
    </Box>
  );
};

export default AnnualCorporateScorecard; 
