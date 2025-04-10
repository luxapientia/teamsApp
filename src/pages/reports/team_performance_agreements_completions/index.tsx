import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Paper,
  InputLabel,
  styled,
} from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';
import { AnnualTarget } from '../../../types/annualCorporateScorecard';
import { fetchAnnualTargets } from '../../../store/slices/scorecardSlice';
import { fetchTeamPerformances } from '../../../store/slices/personalPerformanceSlice';
import { TeamPerformance } from '../../../types';
import { StyledTableCell, StyledHeaderCell } from '../../../components/StyledTableComponents';

const StyledFormControl = styled(FormControl)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: '#D1D5DB',
    },
  },
});

const TeamPerformances: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [showTable, setShowTable] = useState(false);

  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
  const selectedAnnualTarget = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );
  const teamPerformances = useAppSelector((state: RootState) => state.personalPerformance.teamPerformances);

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    setShowTable(false);
  };

  const handleQuarterChange = (event: SelectChangeEvent) => {
    setSelectedQuarter(event.target.value);
    setShowTable(false);
  };

  const handleView = () => {
    if (selectedAnnualTargetId && selectedQuarter) {
      dispatch(fetchTeamPerformances(selectedAnnualTargetId));
      setShowTable(true);
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StyledFormControl fullWidth>
          <Select
            value={selectedAnnualTargetId}
            onChange={handleScorecardChange}
            displayEmpty
            sx={{ backgroundColor: '#fff' }}
          >
            {annualTargets.map((target) => (
              <MenuItem key={target._id} value={target._id}>
                {target.name}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <StyledFormControl sx={{ minWidth: 200 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            value={selectedQuarter}
            label="Quarter"
            onChange={handleQuarterChange}
          >
            {selectedAnnualTarget?.content.quarterlyTarget.quarterlyTargets.map((quarter) => (
              <MenuItem key={quarter.quarter} value={quarter.quarter}>
                {quarter.quarter}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <Button
          variant="contained"
          onClick={handleView}
          disabled={!selectedAnnualTargetId}
          sx={{
            backgroundColor: '#0078D4',
            '&:hover': { backgroundColor: '#106EBE' },
          }}
        >
          View
        </Button>
      </Box>

      {showTable && (
        <Paper sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledHeaderCell>Full Name</StyledHeaderCell>
                <StyledHeaderCell>Job Title</StyledHeaderCell>
                <StyledHeaderCell>Team</StyledHeaderCell>
                <StyledHeaderCell>Status</StyledHeaderCell>
                <StyledHeaderCell>Date, Time</StyledHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                teamPerformances.map((performance: TeamPerformance) => (
                  <TableRow key={performance._id}>
                    <StyledTableCell>{performance.fullName}</StyledTableCell>
                    <StyledTableCell>{performance.jobTitle}</StyledTableCell>
                    <StyledTableCell>{performance.team}</StyledTableCell>
                    <StyledTableCell>{performance.quarterlyTargets.find(quarter => quarter.quarter === selectedQuarter)?.agreementStatus}</StyledTableCell>
                    <StyledTableCell>{new Date().toLocaleString()}</StyledTableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default TeamPerformances;
