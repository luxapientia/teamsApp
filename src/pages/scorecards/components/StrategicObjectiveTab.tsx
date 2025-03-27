import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddStrategicObjectiveModal from './AddStrategicObjectiveModal';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '12px 16px',
  color: '#374151',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '12px 16px',
  color: '#6B7280',
  fontWeight: 500,
}));

interface StrategicObjectiveTabProps {
  targetName: string;
}

const StrategicObjectiveTab: React.FC<StrategicObjectiveTabProps> = ({ targetName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Box p={2}>
      <Stack spacing={2}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledHeaderCell>Perspective</StyledHeaderCell>
              <StyledHeaderCell>Strategic Objective</StyledHeaderCell>
              <StyledHeaderCell>Weight %</StyledHeaderCell>
              <StyledHeaderCell>Key Performance Indicator</StyledHeaderCell>
              <StyledHeaderCell>Baseline</StyledHeaderCell>
              <StyledHeaderCell>Target</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Strategic objectives will be listed here */}
          </TableBody>
        </Table>

        <Button
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{
            color: '#6B7280',
            justifyContent: 'flex-start',
            textTransform: 'none',
            p: 2,
            border: '1px dashed #E5E7EB',
            borderRadius: '8px',
            width: '100%',
            '&:hover': {
              backgroundColor: '#F9FAFB',
              borderColor: '#6264A7',
              color: '#6264A7',
            },
          }}
        >
          Add new
        </Button>
      </Stack>

      <AddStrategicObjectiveModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetName={targetName}
      />
    </Box>
  );
};

export default StrategicObjectiveTab; 