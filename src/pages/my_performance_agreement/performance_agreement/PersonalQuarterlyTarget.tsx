import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, AnnualTargetPerspective } from '@/types/annualCorporateScorecard';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective } from '@/types/personalPerformance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddInitiativeModal from './AddInitiativeModal';

interface Supervisor {
  id: string;
  name: string;
}

interface PersonalQuarterlyTargetProps {
  annualTarget: AnnualTarget;
  quarter: QuarterType;
  isEditing: boolean;
  supervisors?: Supervisor[];
  onSupervisorChange?: (supervisorId: string) => void;
}

const PersonalQuarterlyTarget: React.FC<PersonalQuarterlyTargetProps> = ({
  annualTarget,
  quarter,
  isEditing,
  supervisors = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ],
  onSupervisorChange = () => { },
}) => {
  const [selectedSupervisor, setSelectedSupervisor] = React.useState('');
  const [quarterlyObjectives, setQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
  const [isAddInitiativeModalOpen, setIsAddInitiativeModalOpen] = useState(false);

  const handleSupervisorChange = (event: SelectChangeEvent) => {
    setSelectedSupervisor(event.target.value);
    onSupervisorChange(event.target.value);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">
          {`${annualTarget.name}, ${quarter}`}
        </Typography>
        <FormControl 
          variant="outlined" 
          size="small" 
          sx={{ 
            mt: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E5E7EB',
              },
              '&:hover fieldset': {
                borderColor: '#D1D5DB',
              },
            },
          }}
        >
          <Select
            value={selectedSupervisor}
            onChange={handleSupervisorChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <Typography color="textSecondary">Select Supervisor</Typography>
            </MenuItem>
            {supervisors.map((supervisor) => (
              <MenuItem key={supervisor.id} value={supervisor.id}>
                {supervisor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setIsAddInitiativeModalOpen(true)}
          sx={{
            color: '#6B7280',
            '&:hover': {
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          Add Initiative
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
              sx={{
                backgroundColor: '#F59E0B',
                '&:hover': { backgroundColor: '#D97706' },
              }}
            >
              Draft
            </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#059669',
              '&:hover': { backgroundColor: '#047857' },
            }}
          >
            Submit
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledHeaderCell>Perspective</StyledHeaderCell>
                <StyledHeaderCell>Strategic Objective</StyledHeaderCell>
                <StyledHeaderCell align="center">Weight %</StyledHeaderCell>
                <StyledHeaderCell>Key Performance Indicator</StyledHeaderCell>
                <StyledHeaderCell align="center">Baseline</StyledHeaderCell>
                <StyledHeaderCell align="center">Target</StyledHeaderCell>
                <StyledHeaderCell align="center">Rating Scale</StyledHeaderCell>
                <StyledHeaderCell align="center">Actions</StyledHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        
      </Box>

      {isAddInitiativeModalOpen && (
        <AddInitiativeModal
          open={isAddInitiativeModalOpen}
          onClose={() => setIsAddInitiativeModalOpen(false)}
          annualTarget={annualTarget}
        />
      )}
    </Box >
  );
};

export default PersonalQuarterlyTarget;
