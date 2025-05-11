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
  TableContainer,
} from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';
import { AnnualTarget, AnnualTargetRatingScale, QuarterlyTargetObjective, QuarterType } from '../../../types/annualCorporateScorecard';
import { fetchAnnualTargets } from '../../../store/slices/scorecardSlice';
import { fetchTeamPerformances, fetchPersonalPerformances } from '../../../store/slices/personalPerformanceSlice';
import { TeamPerformance, PersonalPerformance, PersonalQuarterlyTargetObjective } from '../../../types';
import { api } from '../../../services/api';


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

const MyPerformances: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [enableFeedback, setEnableFeedback] = useState(false);

  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
  const personalPerformances = useAppSelector((state: RootState) => state.personalPerformance.personalPerformances);
  const selectedAnnualTarget: AnnualTarget | undefined = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );
  const feedbackTemplates = useAppSelector((state: RootState) => state.feedback.feedbacks);
  useEffect(() => {
    dispatch(fetchAnnualTargets());
    checkFeedbackModule();
  }, [dispatch]);

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    dispatch(fetchPersonalPerformances({ annualTargetId: event.target.value }));
    setShowTable(false);
  };

  const checkFeedbackModule = async () => {
    const isModuleEnabled = await api.get('/module/is-feedback-module-enabled');
    if (isModuleEnabled.data.data.isEnabled) {
      setEnableFeedback(true);
    }
  }

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

  const calculateFeedbackOverallScore = (quarter: QuarterType) => {
    const personalPerformance = personalPerformances.find(performance => performance.annualTargetId === selectedAnnualTargetId);
    const target = personalPerformance.quarterlyTargets.find(t => t.quarter === quarter);
    const selectedFeedbackId = target?.selectedFeedbackId;
    const feedbackResponses = target?.feedbacks.filter(f => f.feedbackId === selectedFeedbackId) || [];
    const feedbackTemplate = feedbackTemplates.find(f => f._id === selectedFeedbackId);

    if (!feedbackTemplate || feedbackResponses.length === 0) return '-';

    let totalWeightedScore = 0;
    let totalWeight = 0;

    feedbackTemplate.dimensions.forEach(dimension => {
      let totalDimensionScore = 0;
      let totalDimensionResponses = 0;
      // Get all questions for this dimension
      const dimensionQuestions = feedbackTemplate.dimensions
        .find(d => d.name === dimension.name)?.questions || [];

      // For each question in the dimension
      dimensionQuestions.forEach(question => {
        feedbackResponses.forEach(feedback => {
          const response = feedback.feedbacks.find(f =>
            f.dimension === dimension.name && f.question === question
          );
          if (response?.response.score) {
            totalDimensionScore += response.response.score;
            totalDimensionResponses++;
          }
        });
      });
      const dimensionScore = totalDimensionScore / totalDimensionResponses;
      totalWeightedScore += dimensionScore * (dimension.weight / 100);
      totalWeight += dimension.weight / 100;
    });


    if (totalWeight === 0) return '-';
    return totalWeightedScore.toFixed(2);
  };


  const calculateFinalScore = (quarter: QuarterType, overallScore: number) => {
    const personalPerformance = personalPerformances.find(performance => performance.annualTargetId === selectedAnnualTargetId);
    if (!personalPerformance) return '-';
    const target = personalPerformance.quarterlyTargets.find(t => t.quarter === quarter);
    const selectedFeedbackId = target?.selectedFeedbackId;
    const feedbackOverallScore = calculateFeedbackOverallScore(quarter);
    const selectedFeedback = feedbackTemplates.find(f => f._id === selectedFeedbackId);
    const contributionScorePercentage = selectedFeedback?.contributionScorePercentage || 0;
    if(selectedFeedback?.status === 'Active' && selectedFeedback?.enableFeedback.some(ef => ef.quarter === quarter && ef.enable)){
      const finalScore = (Number(feedbackOverallScore) * (contributionScorePercentage / 100)) + (Number(overallScore) * (1 - contributionScorePercentage / 100));
      return finalScore;
    }
    return overallScore;
  }

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
        <Box>
          <Paper sx={{
            width: '100%',
            boxShadow: 'none',
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
          }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflowX: 'auto' }}>
              <Table size="small" stickyHeader>
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
            </TableContainer>
          </Paper>
          <Paper sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledHeaderCell>Q1 Overall Performance Score</StyledHeaderCell>
                  <StyledHeaderCell>Q2 Overall Performance Score</StyledHeaderCell>
                  <StyledHeaderCell>Q3 Overall Performance Score</StyledHeaderCell>
                  <StyledHeaderCell>Q4 Overall Performance Score</StyledHeaderCell>
                  <StyledHeaderCell>Overall Annual Performance Score</StyledHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {personalPerformances.map((performance: PersonalPerformance, index: number) => {
                  const quarterScores = performance.quarterlyTargets.map(quarter => {
                    if (annualTargets.find(target => target._id === selectedAnnualTargetId)?.content.quarterlyTarget.quarterlyTargets.find(qt => qt.quarter === quarter.quarter)?.editable) {
                      return enableFeedback ? calculateFinalScore(quarter.quarter, calculateQuarterScore(quarter.objectives)) : calculateQuarterScore(quarter.objectives)
                    }
                    return null
                  });

                  const validScores = quarterScores.filter(score => score) as number[];
                  const annualScore = validScores.length > 0
                    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                    : null;

                  return (
                    <TableRow key={performance._id}>
                      {quarterScores.map((score, idx) => {
                        const ratingScale = getRatingScaleInfo(Number(score), annualTargets.find(target => target._id === selectedAnnualTargetId) as AnnualTarget);
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
        </Box>
      )}
    </Box>
  );
};

export default MyPerformances;
