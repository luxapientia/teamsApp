import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { TargetTab, PageProps } from '../../types';
import AnnualTargetTable from './components/AnnualTargetTable';
import AddAnnualTargetModal from './components/AddAnnualTargetModal';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createAnnualTarget } from '../../store/slices/scorecardSlice';
import AddIcon from '@mui/icons-material/Add';

const AnnualCorporateScorecard: React.FC<PageProps> = ({ title, icon, tabs }) => {
  const [selectedTab, setSelectedTab] = useState<TargetTab>(TargetTab.Annual);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleAddTarget = (target: any) => {
    dispatch(createAnnualTarget(target));
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
        <AnnualTargetTable />
      ) : (
        <div>
          <h1>Quarterly Target Table</h1>
        </div>
      )}

      <AddAnnualTargetModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTarget}
      />
    </Box>
  );
};

export default AnnualCorporateScorecard; 