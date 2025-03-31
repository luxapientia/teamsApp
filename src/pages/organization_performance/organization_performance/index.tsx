import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';
import { AnnualTarget, AnnualTargetRatingScale, QuarterlyTargetObjective } from '../../../types/annualCorporateScorecard';
import { fetchAnnualTargets } from '../../../store/slices/scorecardSlice';

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
  backgroundColor: 'white',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#6B7280',
  fontWeight: 500,
  backgroundColor: '#F9FAFB',
}));

const ScoreBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 16px',
  flex: 1,
  borderRight: '1px solid #E5E7EB',
  '&:last-child': {
    borderRight: 'none',
  },
}));

const OrganizationPerformances: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
  const [showScores, setShowScores] = useState(false);

  const annualTargets = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets
  );

  const selectedAnnualTarget: AnnualTarget | undefined = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    setShowScores(false);
  };

  const calculateQuarterScore = (objectives: QuarterlyTargetObjective[]) => {
    if (!objectives.length) return null;

    let totalScore = 0;
    let count = 0;

    objectives.forEach(objective => {
      objective.KPIs.forEach(kpi => {
        if (kpi.ratingScore) {
          totalScore += kpi.ratingScore;
          count++;
        }
      });
    });

    return totalScore > 0 ? Math.round(totalScore / count) : null;
  };

  const calculateOverallScore = (annualTarget: AnnualTarget) => {
    if (!annualTarget.content.quarterlyTarget.quarterlyTargets.length) return null;

    let totalScore = 0;
    annualTarget.content.quarterlyTarget.quarterlyTargets.forEach(quarter => {
      totalScore += calculateQuarterScore(quarter.objectives) || 0;
    });

    return totalScore > 0 ? Math.round(totalScore / annualTarget.content.quarterlyTarget.quarterlyTargets.length) : null;
  }

  

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

        <ViewButton
          variant="contained"
          disabled={!selectedAnnualTargetId}
          onClick={() => setShowScores(true)}
        >
          View
        </ViewButton>
      </Box>

      {showScores && selectedAnnualTarget && (
        <Box>
          <Paper sx={{
            mb: 4,
            boxShadow: 'none',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
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
                <TableRow
                  sx={{
                    '&:last-child td': { borderBottom: 0 }
                  }}
                >
                  <StyledTableCell>{selectedAnnualTarget.name}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.startDate}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.endDate}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.status}</StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{
            boxShadow: 'none',
            border: '1px solid #E5E7EB',
            mt: 3,
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  {selectedAnnualTarget.content.quarterlyTarget.quarterlyTargets.map((quarter) => (
                    <StyledHeaderCell key={quarter.quarter} align="center">
                      {quarter.quarter} Overall Performance Score
                    </StyledHeaderCell>
                  ))}
                  <StyledHeaderCell align="center">
                    Overall Annual Performance Score
                  </StyledHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {selectedAnnualTarget.content.quarterlyTarget.quarterlyTargets.map((quarter) => {
                    const ratingScales = selectedAnnualTarget.content.ratingScales;
                    const score = calculateQuarterScore(quarter.objectives) || 0;
                    return (
                      <StyledTableCell
                        key={quarter.quarter}
                        align="center"
                        sx={{
                          color: ratingScales.find(scale => scale.score === score)?.color || '#000',
                          fontWeight: 500
                        }}
                      >
                        {
                          ratingScales.find(scale => scale.score === score) && (
                            <>
                              
                              {`${score} ${ratingScales.find(scale => scale.score === score)?.name} (${ratingScales.find(scale => scale.score === score)?.min || ''} - ${ratingScales.find(scale => scale.score === score)?.max || ''})`}
                            </>
                          )
                        }
                      </StyledTableCell>
                    );
                  })}
                  <StyledTableCell
                    align="center"
                    sx={{
                      color: selectedAnnualTarget.content.ratingScales.find(scale => scale.score === calculateOverallScore(selectedAnnualTarget))?.color || '#000',
                      fontWeight: 500
                    }}
                  >

                    {selectedAnnualTarget.content.ratingScales.find(scale => scale.score === calculateOverallScore(selectedAnnualTarget)) && (
                      <>
                        {calculateOverallScore(selectedAnnualTarget)}
                        {`${selectedAnnualTarget.content.ratingScales.find(scale => scale.score === calculateOverallScore(selectedAnnualTarget))?.name} (${selectedAnnualTarget.content.ratingScales.find(scale => scale.score === calculateOverallScore(selectedAnnualTarget))?.min || '0'} - ${selectedAnnualTarget.content.ratingScales.find(scale => scale.score === calculateOverallScore(selectedAnnualTarget))?.max || '100'})`}
                      </>
                    )}
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrganizationPerformances;
