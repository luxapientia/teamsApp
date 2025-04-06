import React, { useState, useEffect } from 'react';
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
  styled,
  Stack,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, AnnualTargetPerspective, QuarterlyTargetKPI, AnnualTargetRatingScale } from '@/types/annualCorporateScorecard';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective, PersonalPerformance, PersonalQuarterlyTarget } from '@/types/personalPerformance';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updatePersonalPerformance } from '../../../store/slices/personalPerformanceSlice';
import { RootState } from '../../../store';
import { api } from '../../../services/api';
import EvidenceModal from './EvidenceModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const AccessButton = styled(Button)({
  backgroundColor: '#0078D4',
  color: 'white',
  textTransform: 'none',
  padding: '6px 16px',
  minWidth: 'unset',
  '&:hover': {
    backgroundColor: '#106EBE',
  },
});

interface Supervisor {
  id: string;
  name: string;
}

interface PersonalQuarterlyTargetProps {
  annualTarget: AnnualTarget;
  quarter: QuarterType;
  supervisors?: Supervisor[];
  onSupervisorChange?: (supervisorId: string) => void;
  onBack?: () => void;
  userId: string;
  teamId: string;
}

const PersonalQuarterlyTargetContent: React.FC<PersonalQuarterlyTargetProps> = ({
  annualTarget,
  quarter,
  onBack,
  userId = '',
  teamId = ''
}) => {
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [personalQuarterlyObjectives, setPersonalQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
  const [personalPerformance, setPersonalPerformance] = useState<PersonalPerformance | null>(null);
  const [companyUsers, setCompanyUsers] = useState<{ id: string, fullName: string, position: string, team: string, teamId: string }[]>([]);

  const [evidenceModalData, setEvidenceModalData] = useState<{
    evidence: string;
    attachments: Array<{ name: string; url: string }>;
  } | null>(null);

  useEffect(() => {
    fetchPersonalPerformance();
    fetchCompanyUsers();
  }, []);

  useEffect(() => {
    if (personalPerformance) {
      setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
      setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
    }
  }, [personalPerformance]);

  const fetchCompanyUsers = async () => {
    try {
      const response = await api.get('/report/company-users');
      if (response.status === 200) {
        setCompanyUsers(response.data.data);
      } else {
        setCompanyUsers([]);
      }
    } catch (error) {
      setCompanyUsers([]);
    }
  }

  const fetchPersonalPerformance = async () => {
    try {
      const response = await api.get(`/personal-performance/personal-performance/`, {
        params: {
          userId: userId,
          annualTargetId: annualTarget._id,
          teamId: teamId
        }
      });

      if (response.status === 200) {
        setPersonalPerformance(response.data.data);
      }
    } catch (error) {
      console.error('Personal performance error:', error);
    }
  }

  // Add function to calculate overall rating score
  const calculateOverallScore = (objectives: QuarterlyTargetObjective[]) => {
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

  // Add function to get rating scale info
  const getRatingScaleInfo = (score: number | null) => {
    if (!score || !annualTarget) return null;

    return annualTarget.content.ratingScales.find(
      scale => scale.score === score
    );
  };

  const handleExportPDF = async () => {
    try {
      // Get the table element
      const table = document.querySelector('.performance-table');
      if (!table) return;

      // Create canvas from table
      const canvas = await html2canvas(table as HTMLElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate dimensions
      const imgWidth = 290; // A4 width in mm
      const pageHeight = 210; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape

      // Add title
      pdf.setFontSize(16);
      pdf.text(`${annualTarget.name}, ${quarter}`, 10, 10);

      // Add table image
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        10, // x position
        20, // y position
        imgWidth,
        imgHeight
      );

      // Save PDF
      pdf.save(`performance-assessment-${quarter}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Box>
      <Box sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          {`${annualTarget.name}, ${quarter}`}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportPDF}
            sx={{
              borderColor: '#E5E7EB',
              color: '#DC2626',
              '&:hover': {
                borderColor: '#DC2626',
                backgroundColor: '#FEF2F2',
              }
            }}
          >
            Export to PDF
          </Button>
          <Button onClick={onBack}>Back</Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
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
            displayEmpty
            disabled={true}
          >
            {companyUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.fullName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper
        className="performance-table"
        sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledHeaderCell>Perspective</StyledHeaderCell>
                <StyledHeaderCell>Strategic Objective</StyledHeaderCell>
                <StyledHeaderCell>Initiative</StyledHeaderCell>
                <StyledHeaderCell align="center">Weight %</StyledHeaderCell>
                <StyledHeaderCell>Key Performance Indicator</StyledHeaderCell>
                <StyledHeaderCell align="center">Baseline</StyledHeaderCell>
                <StyledHeaderCell align="center">Target</StyledHeaderCell>
                <StyledHeaderCell align="center">Actual Achieved</StyledHeaderCell>
                <StyledHeaderCell align="center">Performance Rating Scale</StyledHeaderCell>
                <StyledHeaderCell align="center">Evidence</StyledHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                // Group by perspective and strategic objective
                const groups = personalQuarterlyObjectives.reduce((acc, obj) => {
                  const perspectiveKey = `${obj.perspectiveId}`;
                  const objectiveKey = `${obj.perspectiveId}-${obj.name}`;

                  if (!acc[perspectiveKey]) {
                    acc[perspectiveKey] = {
                      perspectiveId: obj.perspectiveId,
                      perspectiveName: annualTarget.content.perspectives.find(p => p.index === obj.perspectiveId)?.name,
                      objectives: {}
                    };
                  }

                  if (!acc[perspectiveKey].objectives[objectiveKey]) {
                    acc[perspectiveKey].objectives[objectiveKey] = {
                      name: obj.name,
                      initiatives: []
                    };
                  }

                  acc[perspectiveKey].objectives[objectiveKey].initiatives.push(obj);
                  return acc;
                }, {} as Record<string, {
                  perspectiveId: number;
                  perspectiveName: string | undefined;
                  objectives: Record<string, {
                    name: string;
                    initiatives: PersonalQuarterlyTargetObjective[];
                  }>;
                }>);

                // Calculate row spans considering KPI counts
                return Object.values(groups).map(perspectiveGroup => {
                  let firstInPerspective = true;
                  // Calculate total rows for perspective including all KPIs
                  const perspectiveRowSpan = Object.values(perspectiveGroup.objectives)
                    .reduce((sum, obj) => sum + obj.initiatives.reduce((kpiSum, initiative) =>
                      kpiSum + initiative.KPIs.length, 0), 0);

                  return Object.values(perspectiveGroup.objectives).map(objectiveGroup => {
                    let firstInObjective = true;
                    // Calculate total rows for objective including all KPIs
                    const objectiveRowSpan = objectiveGroup.initiatives.reduce((sum, initiative) =>
                      sum + initiative.KPIs.length, 0);

                    return objectiveGroup.initiatives.map((initiative) =>
                      // Map each KPI to a row
                      initiative.KPIs.map((kpi, kpiIndex) => {
                        const row = (
                          <TableRow key={`${initiative.perspectiveId}-${initiative.name}-${initiative.initiativeName}-${kpiIndex}`}>
                            {firstInPerspective && kpiIndex === 0 && (
                              <StyledTableCell rowSpan={perspectiveRowSpan}>
                                {perspectiveGroup.perspectiveName}
                              </StyledTableCell>
                            )}
                            {firstInObjective && kpiIndex === 0 && (
                              <StyledTableCell rowSpan={objectiveRowSpan}>
                                {objectiveGroup.name}
                              </StyledTableCell>
                            )}
                            {kpiIndex === 0 && (
                              <StyledTableCell rowSpan={initiative.KPIs.length}>
                                {initiative.initiativeName}
                              </StyledTableCell>
                            )}
                            <StyledTableCell align="center">
                              {kpi.weight}
                            </StyledTableCell>
                            <StyledTableCell>
                              {kpi.indicator}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {kpi.baseline}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {kpi.target}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {kpi.actualAchieved}
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ color: kpi.ratingScales.find(scale => scale.score === Number(kpi.ratingScore))?.color }}>
                              {
                                kpi.ratingScales.find(scale => scale.score === Number(kpi.ratingScore)) &&
                                `${kpi.ratingScales.find(scale => scale.score === Number(kpi.ratingScore))?.score} ${kpi.ratingScales.find(scale => scale.score === Number(kpi.ratingScore))?.name} (${kpi.ratingScales.find(scale => scale.score === Number(kpi.ratingScore))?.min} - ${kpi.ratingScales.find(scale => scale.score === Number(kpi.ratingScore))?.max})`
                              }
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {kpi.evidence && (
                                <IconButton
                                  size="small"
                                  onClick={() => setEvidenceModalData({
                                    evidence: kpi.evidence,
                                    attachments: kpi.attachments
                                  })}
                                  sx={{ color: '#6B7280' }}
                                >
                                  <DescriptionIcon />
                                </IconButton>
                              )}
                            </StyledTableCell>
                          </TableRow>
                        );

                        if (kpiIndex === 0) {
                          firstInObjective = false;
                        }
                        if (firstInPerspective && kpiIndex === 0) {
                          firstInPerspective = false;
                        }
                        return row;
                      })
                    ).flat();
                  }).flat();
                }).flat();
              })()}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
          Overall Rating Score =
        </Typography>
        {(() => {
          const score = calculateOverallScore(personalQuarterlyObjectives);
          const ratingScale = getRatingScaleInfo(score);

          if (!score || !ratingScale) {
            return (
              <Typography variant="body2" sx={{
                color: '#DC2626',
                fontWeight: 600,
                backgroundColor: '#E5E7EB',
                px: 2,
                py: 0.5,
                borderRadius: 1
              }}>
                N/A
              </Typography>
            );
          }

          return (
            <Typography variant="body2" sx={{
              color: ratingScale.color,
              fontWeight: 600,
              backgroundColor: '#E5E7EB',
              px: 2,
              py: 0.5,
              borderRadius: 1
            }}>
              {`${score} ${ratingScale.name} (${ratingScale.min}-${ratingScale.max})`}
            </Typography>
          );
        })()}
      </Box>

      {evidenceModalData && (
        <EvidenceModal
          open={!!evidenceModalData}
          onClose={() => setEvidenceModalData(null)}
          evidence={evidenceModalData.evidence}
          attachments={evidenceModalData.attachments}
        />
      )}
    </Box >
  );
};

export default PersonalQuarterlyTargetContent;
