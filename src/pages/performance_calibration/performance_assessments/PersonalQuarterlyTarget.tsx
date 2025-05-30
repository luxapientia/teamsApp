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
  IconButton,
  Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useToast } from '../../../contexts/ToastContext';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, AnnualTargetPerspective, QuarterlyTargetKPI, AnnualTargetRatingScale } from '@/types/annualCorporateScorecard';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective, PersonalPerformance, PersonalQuarterlyTarget, AgreementStatus, AssessmentStatus } from '../../../types/personalPerformance';
import RatingScalesModal from '../../../components/RatingScalesModal';
import { api } from '../../../services/api';
import SendBackModal from '../../../components/Modal/SendBackModal';
import ViewSendBackMessageModal from '../../../components/Modal/ViewSendBackMessageModal';
import { useAuth } from '../../../contexts/AuthContext';
import { AgreementReviewStatus } from '../../../types/personalPerformance';
import { QUARTER_ALIAS } from '../../../constants/quarterAlias';
import CommentModal from '../../../components/CommentModal';


interface PersonalQuarterlyTargetProps {
  annualTarget: AnnualTarget;
  quarter: QuarterType;
  isEnabledTwoQuarterMode: boolean;
  onBack?: () => void;
  userId: string;
  userName: string;
}

type Action = 'accept' | 'sendBack' | 'unaccept';

const PersonalQuarterlyTargetContent: React.FC<PersonalQuarterlyTargetProps> = ({
  annualTarget,
  quarter,
  isEnabledTwoQuarterMode,
  onBack,
  userId,
  userName
}) => {
  const { user } = useAuth();
  const [selectedSupervisor, setSelectedSupervisor] = React.useState('');
  const [personalQuarterlyObjectives, setPersonalQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
  const [personalPerformance, setPersonalPerformance] = React.useState<PersonalPerformance | null>(null);
  const [selectedRatingScales, setSelectedRatingScales] = React.useState<AnnualTargetRatingScale[] | null>(null);
  const [companyUsers, setCompanyUsers] = useState<{ id: string, fullName: string, jobTitle: string, team: string, teamId: string }[]>([]);
  const { showToast } = useToast();
  const [sendBackModalOpen, setSendBackModalOpen] = useState(false);
  const [isAssessmentCommitteeSendBack, setIsAssessmentCommitteeSendBack] = useState(false);
  const [pmCommitteeStatus, setPmCommitteeStatus] = useState<'Not Reviewed' | 'Reviewed' | 'Send Back'>(
    personalPerformance?.quarterlyTargets.find(target => target.quarter === quarter)?.assessmentReviewStatus || 'Not Reviewed'
  );
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [sendBackLoading, setSendBackLoading] = useState(false);
  const [viewSendBackModalOpen, setViewSendBackModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState('');

  const currentQuarterTarget = personalPerformance?.quarterlyTargets.find(target => target.quarter === quarter);

  useEffect(() => {
    fetchPersonalPerformance();
    fetchCompanyUsers();
  }, []);

  useEffect(() => {
    if (personalPerformance) {
      const currentTarget = personalPerformance.quarterlyTargets.find(target => target.quarter === quarter);
      setPersonalQuarterlyObjectives(currentTarget?.objectives || []);
      const supervisorId = currentTarget?.supervisorId || '';
      if (companyUsers.some(user => user.id === supervisorId)) {
        setSelectedSupervisor(supervisorId);
      } else {
        setSelectedSupervisor('');
      }
      setIsAssessmentCommitteeSendBack(currentTarget?.isAssessmentCommitteeSendBack || false);
      setPmCommitteeStatus(currentTarget?.assessmentReviewStatus || 'Not Reviewed');
    }
  }, [personalPerformance, companyUsers, quarter]);

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
        }
      });

      if (response.status === 200) {
        setPersonalPerformance(response.data.data);
      }
    } catch (error) {
      console.error('Personal performance error:', error);
    }
  }

  const calculateTotalWeight = () => {
    return personalQuarterlyObjectives.reduce((total, objective) => {
      const totalWeight = objective.KPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
      return total + totalWeight;
    }, 0);
  };

  const handleCommitteeAction = async (
    action: Action,
    { emailSubject, emailBody }: { emailSubject?: string; emailBody?: string } = {}
  ) => {
    if (personalPerformance) {
      try {
        if (action === 'accept') setAcceptLoading(true);
        if (action === 'sendBack') setSendBackLoading(true);
        await api.post('/users/performance-calibration/pm-committee-action-assessment', {
          userId: userId,
          performanceId: personalPerformance._id,
          quarter,
          action,
          emailSubject,
          emailBody
        });
        if (action === 'accept') {
          setPmCommitteeStatus(AgreementReviewStatus.Reviewed);
          showToast('Assessment accepted and email sent successfully', 'success');
        }
        if (action === 'sendBack') {
          setPmCommitteeStatus(AgreementReviewStatus.NotReviewed);
          showToast('Assessment sent back and email sent successfully', 'success');
        }
        if (action === 'unaccept') setPmCommitteeStatus(AgreementReviewStatus.NotReviewed);
      } catch (error) {
        if (action === 'accept') {
          showToast('Failed to send email or accept assessment', 'error');
        }
        console.error('Error handling committee action:', error);
      } finally {
        if (action === 'accept') setAcceptLoading(false);
        if (action === 'sendBack') setSendBackLoading(false);
      }
    }
  };

  const handleSendBack = (emailSubject: string, emailBody: string) => {
    if (personalPerformance) {
      handleCommitteeAction('sendBack', { emailSubject, emailBody });
      onBack?.();
    }
  };

  const showCommentModal = (initiative: PersonalQuarterlyTargetObjective, kpiIndex: number) => {
    setSelectedComment(initiative.KPIs[kpiIndex].previousAgreementComment || '');
    setCommentModalOpen(true);
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
          {`${annualTarget.name}, ${userName} Performance Assessment ${isEnabledTwoQuarterMode ? QUARTER_ALIAS[quarter] : quarter}`}
        </Typography>
      </Box>

      <Box sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
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
          {companyUsers.length > 0 ? (
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
          ) : (
            <Select value="" displayEmpty disabled>
              <MenuItem value="">No supervisors available</MenuItem>
            </Select>
          )}
        </FormControl>
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isAssessmentCommitteeSendBack ? (
            <>
              <Chip
                label={'PM Committee Send Back'}
                size="medium"
                color={'error'}
                sx={{
                  height: '30px',
                  fontSize: '0.75rem',
                  alignSelf: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const currentTarget = personalPerformance?.quarterlyTargets.find(target => target.quarter === quarter);
                  if (currentTarget?.assessmentCommitteeSendBackMessage) {
                    setViewSendBackModalOpen(true);
                  }
                }}
              />
              <Chip
                label={'Approved'}
                size="medium"
                color={'success'}
                sx={{
                  height: '30px',
                  fontSize: '0.75rem',
                  alignSelf: 'center'
                }}
              />
            </>
          ) : (
            <Chip
              label={'Approved'}
              size="medium"
              color={'success'}
              sx={{
                height: '30px',
                fontSize: '0.75rem',
                alignSelf: 'center'
              }}
            />
          )}
          {pmCommitteeStatus === 'Reviewed' ? (
            <Button
              variant="contained"
              onClick={() => handleCommitteeAction('unaccept')}
              sx={{
                backgroundColor: '#10B981',
                '&:hover': {
                  backgroundColor: '#059669',
                },
              }}
            >
              PM Committee Unaccept
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                onClick={() => handleCommitteeAction('accept')}
                sx={{
                  backgroundColor: '#10B981',
                  '&:hover': {
                    backgroundColor: '#059669',
                  },
                  width: '200px'
                }}
                disabled={acceptLoading}
              >
                {acceptLoading ? 'Processing...' : 'PM Committee Accept'}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setSendBackModalOpen(true)}
                disabled={sendBackLoading}
              >
                {sendBackLoading ? 'Processing...' : 'PM Committee Send Back'}
              </Button>
            </>
          )}
        </Box>
      </Box>

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
            color: calculateTotalWeight() > 100 ? '#DC2626' : '#374151'
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
                <StyledHeaderCell align="center">Rating Scale</StyledHeaderCell>
                <StyledHeaderCell align="center">Comments</StyledHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
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

                return Object.values(groups).map(perspectiveGroup => {
                  let firstInPerspective = true;
                  const perspectiveRowSpan = Object.values(perspectiveGroup.objectives)
                    .reduce((sum, obj) => sum + obj.initiatives.reduce((kpiSum, initiative) =>
                      kpiSum + initiative.KPIs.length, 0), 0);

                  return Object.values(perspectiveGroup.objectives).map(objectiveGroup => {
                    let firstInObjective = true;
                    const objectiveRowSpan = objectiveGroup.initiatives.reduce((sum, initiative) =>
                      sum + initiative.KPIs.length, 0);

                    return objectiveGroup.initiatives.map((initiative) =>
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
                            <StyledTableCell align="center">
                              <IconButton
                                size="small"
                                sx={{
                                  borderColor: '#E5E7EB',
                                  color: '#374151',
                                  '&:hover': {
                                    borderColor: '#D1D5DB',
                                    backgroundColor: '#F9FAFB',
                                  },
                                }}
                                onClick={() => {
                                  setSelectedRatingScales(kpi.ratingScales);
                                }}
                              >
                                <DescriptionIcon />
                              </IconButton>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {kpi.previousAssessmentComment &&
                                <IconButton
                                  size="small"
                                  onClick={() => showCommentModal(initiative, kpiIndex)}
                                  sx={{
                                    color: '#DC2626',
                                    '&:hover': {
                                      backgroundColor: '#FEF2F2',
                                    },
                                  }}
                                >
                                  <DescriptionIcon />
                                </IconButton>}
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

      <SendBackModal
        open={sendBackModalOpen}
        onClose={() => setSendBackModalOpen(false)}
        onSendBack={handleSendBack}
        title="PM Committee Send Back Email"
        emailSubject={`${annualTarget.name}, Performance Assessment ${isEnabledTwoQuarterMode ? QUARTER_ALIAS[quarter] : quarter}(PM Committee Review)`}
      />

      <ViewSendBackMessageModal
        open={viewSendBackModalOpen}
        onClose={() => setViewSendBackModalOpen(false)}
        emailSubject={`${annualTarget.name}, Performance Assessment ${isEnabledTwoQuarterMode ? QUARTER_ALIAS[quarter] : quarter}(PM Committee Review)`}
        emailBody={personalPerformance?.quarterlyTargets.find(target => target.quarter === quarter)?.assessmentCommitteeSendBackMessage || 'No message available'}
      />

      {selectedRatingScales && (
        <RatingScalesModal
          open={!!selectedRatingScales}
          onClose={() => setSelectedRatingScales(null)}
          ratingScales={selectedRatingScales}
        />
      )}

      <CommentModal
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        comment={selectedComment}
      />
    </Box>
  );
};

export default PersonalQuarterlyTargetContent;
