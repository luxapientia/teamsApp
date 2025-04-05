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
import { fetchTeamPerformances } from '../../../store/slices/personalPerformanceSlice';
import { PersonalPerformance, PersonalQuarterlyTargetObjective } from '../../../types';
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

const TeamPerformance: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
  const [showTable, setShowTable] = useState(false);

  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
  const teamPerformances = useAppSelector((state: RootState) => state.personalPerformance.teamPerformances);

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    setShowTable(false);
  };

  const handleView = () => {
    if (selectedAnnualTargetId) {
      dispatch(fetchTeamPerformances(selectedAnnualTargetId));
      setShowTable(true);
    }
  };

  const calculateQuarterScore = (objectives: PersonalQuarterlyTargetObjective[]) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    objectives.forEach(objective => {
      objective.KPIs.forEach(kpi => {
        if (kpi.ratingScore !== -1) {
          totalWeightedScore += (kpi.ratingScore * kpi.weight);
          totalWeight += kpi.weight;
        }
      });
    });

    if (totalWeight === 0) return null;
    return Math.round(totalWeightedScore / totalWeight);
  };

  const getRatingScaleInfo = (score: number | null, annualTarget: AnnualTarget) => {
    if (!score) return null;

    return annualTarget.content.ratingScales.find(
      scale => scale.score === score
    );
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
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
        </FormControl>

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
                <StyledHeaderCell>Position</StyledHeaderCell>
                <StyledHeaderCell>Team</StyledHeaderCell>
                <StyledHeaderCell>Q1 Overall Performance Score</StyledHeaderCell>
                <StyledHeaderCell>Q2 Overall Performance Score</StyledHeaderCell>
                <StyledHeaderCell>Q3 Overall Performance Score</StyledHeaderCell>
                <StyledHeaderCell>Q4 Overall Performance Score</StyledHeaderCell>
                <StyledHeaderCell>Overall Annual Performance Score</StyledHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamPerformances.map((performance: PersonalPerformance, index: number) => {
                const quarterScores = performance.quarterlyTargets.map(quarter => {
                  return calculateQuarterScore(quarter.objectives)
                });

                const validScores = quarterScores.filter(score => score !== null) as number[];
                const annualScore = validScores.length > 0
                  ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                  : null;

                return (
                  <TableRow key={performance._id}>
                    <StyledTableCell>{"-----"}</StyledTableCell>
                    <StyledTableCell>{"-----"}</StyledTableCell>
                    <StyledTableCell>{"-----"}</StyledTableCell>
                    {quarterScores.map((score, idx) => {
                      const ratingScale = getRatingScaleInfo(score, annualTargets.find(target => target._id === selectedAnnualTargetId) as AnnualTarget);
                      return (
                        <StyledTableCell key={idx}>
                          <Typography sx={{ color: ratingScale?.color }}>
                            {ratingScale ? `${score} ${ratingScale.name} (${ratingScale.min}-${ratingScale.max})` : 'N/A'}
                          </Typography>
                        </StyledTableCell>
                      )
                    })}
                    {(() => {
                      const ratingScale = getRatingScaleInfo(annualScore, annualTargets.find(target => target._id === selectedAnnualTargetId) as AnnualTarget);
                      return (
                        <StyledTableCell>
                          <Typography sx={{ color: ratingScale?.color }}>
                            {ratingScale ? `${annualScore} ${ratingScale.name} (${ratingScale.min}-${ratingScale.max})` : 'N/A'}
                          </Typography>
                        </StyledTableCell>
                      );
                    })()}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default TeamPerformance;
