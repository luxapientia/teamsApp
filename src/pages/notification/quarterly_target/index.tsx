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
  Stack,
  Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, AnnualTargetPerspective, QuarterlyTargetKPI, AnnualTargetRatingScale } from '@/types/annualCorporateScorecard';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective, PersonalPerformance, PersonalQuarterlyTarget, AgreementStatus, AgreementReviewStatus } from '../../../types/personalPerformance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddInitiativeModal from './AddInitiativeModal';
import RatingScalesModal from '../../../components/RatingScalesModal';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updatePersonalPerformance } from '../../../store/slices/personalPerformanceSlice';
import { api } from '../../../services/api';
import { Notification } from '@/types';
import { fetchNotifications } from '../../../store/slices/notificationSlice';
import SendBackModal from '../../../components/Modal/SendBackModal';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Toast } from '../../../components/Toast';
import ViewSendBackMessageModal from '../../../components/Modal/ViewSendBackMessageModal';

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
  const [selectedRatingScales, setSelectedRatingScales] = useState<AnnualTargetRatingScale[] | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<{ id: string, name: string }[]>([]);
  const [personalPerformance, setPersonalPerformance] = useState<PersonalPerformance | null>(null);
  const [sendBackModalOpen, setSendBackModalOpen] = useState(false);
  const [isAgreementCommitteeSendBack, setIsAgreementCommitteeSendBack] = useState(false);
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSendingBack, setIsSendingBack] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewSendBackModalOpen, setViewSendBackModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanyUsers();
    fetchPersonalPerformance();
  }, []);

  useEffect(() => {
    if (personalPerformance) {
      setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
      setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
      setIsSubmitted(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.agreementStatus === AgreementStatus.Submitted);
      setIsAgreementCommitteeSendBack(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.isAgreementCommitteeSendBack || false);
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

  const handleViewRatingScales = (kpi: QuarterlyTargetKPI) => {
    setSelectedRatingScales(kpi.ratingScales);
  };

  const handleApprove = async () => {
    if (notification) {
      setIsApproving(true);
      try {
        const response = await api.post(`/notifications/approve/${notification._id}`);
        if (response.status === 200) {
          dispatch(fetchNotifications());
          setToast({
            message: 'Performance agreement approved successfully',
            type: 'success'
          });
          onBack?.();
        }
      } catch (error) {
        console.error('Error approving notification:', error);
        setToast({
          message: 'Failed to approve performance agreement',
          type: 'error'
        });
      } finally {
        setIsApproving(false);
      }
    }
  };

  const handleSendBack = (emailSubject: string, emailBody: string) => {
    if (notification) {
      setIsSendingBack(true);
      (async () => {
        try {
          const response = await api.post(`/notifications/send-back/${notification._id}`, {
            emailSubject,
            emailBody,
            senderId: notification.sender._id
          });
          dispatch(fetchNotifications());
          if (response.status === 200) {
            setToast({
              message: 'Performance agreement sent back successfully',
              type: 'success'
            });
            onBack?.();
          }
        } catch (error) {
          console.error('Error send back notification:', error);
          setToast({
            message: 'Failed to send back performance agreement',
            type: 'error'
          });
        } finally {
          setIsSendingBack(false);
        }
      })();
    }
  };

  // Add total weight calculation function
  const calculateTotalWeight = () => {
    return personalQuarterlyObjectives.reduce((total, objective) => {
      const totalWeight = objective.KPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
      return total + totalWeight;
    }, 0);
  };

  return (
    <Box>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
          {isAgreementCommitteeSendBack && (
            <Chip
              label="PM Committee Send Back Notes"
              size="medium"
              color="error"
              sx={{
                height: '30px',
                fontSize: '0.75rem',
                alignSelf: 'center',
                cursor: 'pointer'
              }}
              onClick={() => {
                const currentTarget = personalPerformance?.quarterlyTargets.find(target => target.quarter === quarter);
                if (currentTarget?.agreementCommitteeSendBackMessage) {
                  setViewSendBackModalOpen(true);
                }
              }}
            />
          )}
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
            disabled={isApproving || isSendingBack}
          >
            {isApproving ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#F59E0B',
              '&:hover': {
                backgroundColor: '#D97706'
              },
              '&.Mui-disabled': {
                backgroundColor: '#E5E7EB',
                color: '#9CA3AF'
              }
            }}
            onClick={() => setSendBackModalOpen(true)}
            disabled={isApproving || isSendingBack}
          >
            {isSendingBack ? 'Processing...' : 'Send Back'}
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
                <StyledHeaderCell align="center">Rating Scale</StyledHeaderCell>
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
                              <IconButton
                                size="small"
                                onClick={() => handleViewRatingScales(kpi)}
                                sx={{
                                  borderColor: '#E5E7EB',
                                  color: '#374151',
                                  '&:hover': {
                                    borderColor: '#D1D5DB',
                                    backgroundColor: '#F9FAFB',
                                  },
                                }}
                              >
                                <DescriptionIcon />
                              </IconButton>
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>

      </Box>

      {selectedRatingScales && (
        <RatingScalesModal
          open={!!selectedRatingScales}
          onClose={() => setSelectedRatingScales(null)}
          ratingScales={selectedRatingScales}
        />
      )}

      <SendBackModal
        open={sendBackModalOpen}
        onClose={() => setSendBackModalOpen(false)}
        onSendBack={handleSendBack}
        title="Send Back Email"
        emailSubject={`${annualTarget.name} - Performance ${notification?.type === 'agreement' ? 'Agreement' : 'Assessment'} ${quarter}`}
      />

      <ViewSendBackMessageModal
        open={viewSendBackModalOpen}
        onClose={() => setViewSendBackModalOpen(false)}
        emailSubject={`${annualTarget.name}, Performance Agreement ${quarter}(PM Committee Review)`}
        emailBody={personalPerformance?.quarterlyTargets.find(target => target.quarter === quarter)?.agreementCommitteeSendBackMessage || 'No message available'}
      />
    </Box >
  );
};

export default PersonalQuarterlyTargetContent;
