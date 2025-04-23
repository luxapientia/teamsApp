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
  Chip,
  Skeleton,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, QuarterlyTargetKPI } from '@/types';
import { Notification } from '@/types';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective, PersonalPerformance, PersonalQuarterlyTarget, AssessmentStatus } from '../../../types/personalPerformance';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updatePersonalPerformance } from '../../../store/slices/personalPerformanceSlice';
import { RootState } from '../../../store';
import { api } from '../../../services/api';
import EvidenceModal from './EvidenceModal';
import { fetchNotifications } from '../../../store/slices/notificationSlice';
import SendBackModal from '../../../components/Modal/SendBackModal';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';

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

interface PersonalQuarterlyTargetProps {
  annualTarget: AnnualTarget;
  quarter: QuarterType;
  onBack?: () => void;
  notification?: Notification | null;
}

const PersonalQuarterlyTargetContent: React.FC<PersonalQuarterlyTargetProps> = ({
  annualTarget,
  quarter,
  onBack,
  notification = null,
}) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [selectedSupervisor, setSelectedSupervisor] = React.useState('');
  const [personalQuarterlyObjectives, setPersonalQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evidenceModalData, setEvidenceModalData] = useState<{
    evidence: string;
    attachments: Array<{ name: string; url: string }>;
  } | null>(null);
  const [companyUsers, setCompanyUsers] = useState<{ id: string, name: string }[]>([]);
  const [personalPerformance, setPersonalPerformance] = useState<PersonalPerformance | null>(null);
  const [sendBackModalOpen, setSendBackModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCompanyUsers();
    fetchPersonalPerformance();
  }, []);

  useEffect(() => {
    if (personalPerformance) {
      setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
      setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
      setIsSubmitted(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.assessmentStatus === 'Submitted');
    }
  }, [personalPerformance]);

  const fetchCompanyUsers = async () => {
    try {
      const response = await api.get('/personal-performance/company-users');
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
      const response = await api.get(`/notifications/personal-performance/${notification?._id}`);
      if (response.status === 200) {
        setPersonalPerformance(response.data.data);
      } else {
        setPersonalPerformance(null);
      }
    } catch (error) {
      console.error('Error fetching personal performance:', error);
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

  // Add function to get rating score info
  const getRatingScoreInfo = (score: number | null) => {
    if (!score || !annualTarget) return null;

    return annualTarget.content.ratingScales.find(
      scale => scale.score === score
    );
  };

  // Add total weight calculation function
  const calculateTotalWeight = () => {
    return personalQuarterlyObjectives.reduce((total, objective) => {
      const totalWeight = objective.KPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
      return total + totalWeight;
    }, 0);
  };

  const handleApprove = async () => {
    if (notification) {
      try {
        const response = await api.post(`/notifications/approve/${notification._id}`);
        if (response.status === 200) {
          dispatch(fetchNotifications());
          onBack?.();
        }
      } catch (error) {
        console.error('Error approving notification:', error);
      }
    }
  };

  const handleSendBack = (emailSubject: string, emailBody: string) => {
    if (notification) {
      (async () => {
        try {
          const response = await api.post(`/notifications/send-back/${notification._id}`, {
            emailSubject,
            emailBody,
            senderId: notification.sender._id
          });
          dispatch(fetchNotifications());
          if (response.status === 200) {
            showToast('email sent successfully', 'success');
          }
        } catch (error) {
          console.error('Error send back notification:', error);
          showToast('sending email failed', 'error');
        }
      })();
      onBack?.();
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
          {`${annualTarget.name}, ${user?.displayName} ${notification?.type === 'agreement' ? 'Agreement' : 'Assessment'} ${quarter}`}
        </Typography>

        <Button
          onClick={onBack}
          variant="outlined"
          color="primary"
          sx={{
            minWidth: '100px',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          Back
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#059669',
              '&:hover': {
                backgroundColor: '#047857'
              },
              '&.Mui-disabled': {
                backgroundColor: '#E5E7EB',
                color: '#9CA3AF'
              }
            }}
            onClick={handleApprove}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#F59E0B',
              '&:hover': {
                backgroundColor: '#D97706'
              },
              cursor: 'pointer'
            }}
            onClick={() => setSendBackModalOpen(true)}
          >
            Send Back
          </Button>
        </Box>
      </Box>

      {/* Add total weight display */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2,
          borderTop: '1px solid #E5E7EB'
        }}
      >
        <Typography
          sx={{
            fontWeight: 500,
            color: calculateTotalWeight() === 100 ? '#059669' : '#DC2626'
          }}
        >
          Total Weight: {calculateTotalWeight()}%
          {calculateTotalWeight() > 100 && (
            <Typography
              component="span"
              sx={{
                color: '#DC2626',
                ml: 2,
                fontSize: '0.875rem'
              }}
            >
              (Total weight cannot exceed 100%)
            </Typography>
          )}
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
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
                <StyledHeaderCell align="center">Performance Rating Score</StyledHeaderCell>
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
          const ratingScore = getRatingScoreInfo(score);

          if (!score || !ratingScore) {
            return (
              <Typography variant="body2" sx={{
                color: '#DC2626',
                fontWeight: 600,
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
              color: ratingScore.color,
              fontWeight: 600,
              px: 2,
              py: 0.5,
              borderRadius: 1
            }}>
              {`${score} ${ratingScore.name} (${ratingScore.min}-${ratingScore.max})`}
            </Typography>
          );
        })()}
      </Box>

      <Box sx={{ mt: 4, mb: 2, backgroundColor: '#F3F4F6', padding: 2, borderRadius: 2 }}>
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h6">
            Personal Development Courses
          </Typography>
        </Box>

        <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB', mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledHeaderCell>Course Name</StyledHeaderCell>
                  <StyledHeaderCell>Description</StyledHeaderCell>
                  <StyledHeaderCell align="center">Status</StyledHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {personalPerformance?.quarterlyTargets?.find(qt => qt.quarter === quarter)?.personalDevelopment?.map((course, index) => (
                  <TableRow key={course._id}>
                    <StyledTableCell>
                      {typeof course === 'string' ? (
                        <Skeleton variant="text" width={200} />
                      ) : (
                        course.name
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {typeof course === 'string' ? (
                        <Skeleton variant="text" width={300} />
                      ) : (
                        course.description
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {typeof course === 'string' ? (
                        <Skeleton variant="text" width={100} />
                      ) : (
                        <Chip
                          label={course.status}
                          size="small"
                          sx={{
                            backgroundColor: course.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                            color: course.status === 'active' ? '#059669' : '#DC2626',
                            fontWeight: 500
                          }}
                        />
                      )}
                    </StyledTableCell>
                  </TableRow>
                ))}
                {(!personalPerformance?.quarterlyTargets?.find(qt => qt.quarter === quarter)?.personalDevelopment ||
                  personalPerformance.quarterlyTargets.find(qt => qt.quarter === quarter)?.personalDevelopment.length === 0) && (
                    <TableRow>
                      <StyledTableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          No personal development courses added
                        </Typography>
                      </StyledTableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {evidenceModalData && (
        <EvidenceModal
          open={!!evidenceModalData}
          onClose={() => setEvidenceModalData(null)}
          evidence={evidenceModalData.evidence}
          attachments={evidenceModalData.attachments}
        />
      )}

      <SendBackModal
        open={sendBackModalOpen}
        onClose={() => setSendBackModalOpen(false)}
        onSendBack={handleSendBack}
        title="Send Back Email"
        emailSubject={`${annualTarget.name} - Performance ${notification?.type === 'agreement' ? 'Agreement' : 'Assessment'} ${quarter}`}
      />
    </Box >
  );
};

export default PersonalQuarterlyTargetContent;
