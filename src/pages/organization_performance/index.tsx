import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  styled,
  SelectChangeEvent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { RootState } from '../../store';
import { QuarterType, AnnualTargetObjective } from '../../types/annualCorporateScorecard';
// import QuarterlyObjectiveModal from './QuarterlyObjectiveModal';
import { updateAnnualTarget } from '../../store/slices/scorecardSlice';
import { PageProps } from '@/types';

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

const ViewButton = styled(Button)({
  backgroundColor: '#0078D4',
  color: 'white',
  textTransform: 'none',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: '#106EBE',
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#374151',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#6B7280',
  fontWeight: 500,
}));

const OrganizationPerformance: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [showTable, setShowTable] = useState(false);

  const annualTargets = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets
  );

  const selectedAnnualTarget = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );

  const dispatch = useAppDispatch();

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    setShowTable(false);
  };

  const handleQuarterChange = (event: SelectChangeEvent) => {
    setSelectedQuarter(event.target.value);
    setShowTable(false);
  };

  const handleView = () => {
    if (selectedAnnualTarget) {
      if (selectedAnnualTarget.content.totalWeight >= 100) {
        dispatch(updateAnnualTarget({
          ...selectedAnnualTarget,
          content: {
            ...selectedAnnualTarget.content,
            quarterlyTarget: {
              ...selectedAnnualTarget.content.quarterlyTarget,
              editable: true,
            }
          }
        }));
      }
    }
    setShowTable(true);
  };

  const getQuarterlyObjectives = () => {
    if (!selectedAnnualTarget || !selectedQuarter) return [];
    
    const quarterData = selectedAnnualTarget.content.quarterlyTarget.quarterlyTargets
      .find(q => q.quarter === selectedQuarter);

    if (!quarterData?.objectives) return [];
    
    return [...quarterData.objectives].sort((a, b) => a.perspectiveId - b.perspectiveId);
  };

  const calculateTotalWeight = (objectives: AnnualTargetObjective[]) => {
    let total = 0;
    objectives.forEach(objective => {
      objective.KPIs.forEach(kpi => {
        total += Number(kpi.weight) || 0;
      });
    });
    return total;
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StyledFormControl fullWidth>
          <InputLabel>Annual Corporate Scorecard</InputLabel>
          <Select
            value={selectedAnnualTargetId}
            label="Annual Corporate Scorecard"
            onChange={handleScorecardChange}
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

        <ViewButton
          variant="contained"
          disabled={!selectedAnnualTargetId || !selectedQuarter}
          onClick={handleView}
        >
          View
        </ViewButton>
      </Box>

      {showTable && selectedAnnualTarget && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quarterly Corporate Scorecard - {selectedQuarter}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledHeaderCell>Annual Corporate Scorecard</StyledHeaderCell>
                  <StyledHeaderCell>Start Date</StyledHeaderCell>
                  <StyledHeaderCell>End Date</StyledHeaderCell>
                  <StyledHeaderCell>Status</StyledHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>{selectedAnnualTarget.name}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.startDate}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.endDate}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.status}</StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                fontWeight: 500 
              }}
            >
              Total Weight:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: calculateTotalWeight(getQuarterlyObjectives()) === 100 ? '#059669' : '#DC2626',
                fontWeight: 600 
              }}
            >
              {calculateTotalWeight(getQuarterlyObjectives())}%
            </Typography>
          </Box>

          <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledHeaderCell>Perspective</StyledHeaderCell>
                  <StyledHeaderCell>Strategic Objective</StyledHeaderCell>
                  <StyledHeaderCell align="center">Weight %</StyledHeaderCell>
                  <StyledHeaderCell>Key Performance Indicator</StyledHeaderCell>
                  <StyledHeaderCell align="center">Baseline</StyledHeaderCell>
                  <StyledHeaderCell align="center">Target</StyledHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getQuarterlyObjectives().map((objective) => (
                  objective.KPIs.map((kpi, kpiIndex) => (
                    <TableRow key={`${objective.name}-${kpiIndex}`}>
                      {kpiIndex === 0 && (
                        <>
                          <StyledTableCell rowSpan={objective.KPIs.length}>
                            {selectedAnnualTarget?.content.perspectives.find(p => p.index === objective.perspectiveId)?.name}
                          </StyledTableCell>
                          <StyledTableCell rowSpan={objective.KPIs.length}>
                            {objective.name}
                          </StyledTableCell>
                        </>
                      )}
                      <StyledTableCell align="center">{kpi.weight}</StyledTableCell>
                      <StyledTableCell>{kpi.indicator}</StyledTableCell>
                      <StyledTableCell align="center">{kpi.baseline}</StyledTableCell>
                      <StyledTableCell align="center">{kpi.target}</StyledTableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrganizationPerformance;
