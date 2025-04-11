import React, { useState, useEffect, useRef } from 'react';
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
import { AnnualTarget, AnnualTargetRatingScale, QuarterlyTargetObjective, PdfType } from '../../../types';
import { fetchAnnualTargets } from '../../../store/slices/scorecardSlice';
import { ExportButton } from '../../../components/Buttons';

import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { exportPdf } from '../../../utils/exportPdf';


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
  const tableRef = useRef();

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

  const calculateOverallScore = (annualTarget: AnnualTarget) => {
    let totalWeightedScore = 0;
    let totalQuarters = 0;

    annualTarget.content.quarterlyTarget.quarterlyTargets.forEach(quarter => {
      const quarterScore = calculateQuarterScore(quarter.objectives);
      if (quarterScore !== null) {
        totalWeightedScore += quarterScore;
        totalQuarters++;
      }
    });

    if (totalQuarters === 0) return null;
    return Math.round(totalWeightedScore / totalQuarters);
  };

  const getRatingScaleInfo = (score: number | null, annualTarget: AnnualTarget) => {
    if (!score) return null;

    return annualTarget.content.ratingScales.find(
      scale => scale.score === score
    );
  };

  const handleExportPDF = async () => {
    if (selectedAnnualTarget?.content.quarterlyTarget.quarterlyTargets.length > 0) {
      const title = `${selectedAnnualTarget?.name}`;
      exportPdf(PdfType.PerformanceEvaluation, tableRef, title, '', '', [0.2, 0.2, 0.2, 0.2, 0.2]);
    }
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
          <ExportButton
            className="pdf"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportPDF}
            size="small"
            sx={{marginTop: 2}}
          >
            Export to PDF
          </ExportButton>
          <Paper sx={{
            width: '100%',
            boxShadow: 'none',
            border: '1px solid #E5E7EB',
            mt: 3,
            overflow: 'hidden'
          }}>

            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflowX: 'auto' }}>
              <Table size="small" stickyHeader ref={tableRef}>
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
                      const score = calculateQuarterScore(quarter.objectives);
                      const ratingScale = getRatingScaleInfo(score, selectedAnnualTarget);

                      return (
                        <StyledTableCell
                          key={quarter.quarter}
                          align="center"
                          sx={{
                            color: ratingScale?.color || '#DC2626',
                            fontWeight: 500
                          }}
                          data-color={ratingScale?.color || '#DC2626'}
                          >
                          {score && ratingScale ? (
                            `${score} ${ratingScale.name} (${ratingScale.min}-${ratingScale.max})`
                          ) : (
                            'N/A'
                          )}
                        </StyledTableCell>
                      );
                    })}
                    {(() => {
                      const overallScore = calculateOverallScore(selectedAnnualTarget);
                      const overallRatingScale = getRatingScaleInfo(overallScore, selectedAnnualTarget);

                      return (
                        <StyledTableCell
                          align="center"
                          sx={{
                            color: overallRatingScale?.color || '#DC2626',
                            fontWeight: 500
                          }}
                        >
                          {overallScore && overallRatingScale ? (
                            `${overallScore} ${overallRatingScale.name} (${overallRatingScale.min}-${overallRatingScale.max})`
                          ) : (
                            'N/A'
                          )}
                        </StyledTableCell>
                      );
                    })()}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default OrganizationPerformances;
