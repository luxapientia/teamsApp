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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, AnnualTargetPerspective, QuarterlyTargetKPI, AnnualTargetRatingScale } from '@/types/annualCorporateScorecard';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective, PersonalPerformance, PersonalQuarterlyTarget, AgreementStatus } from '../../../types/personalPerformance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddInitiativeModal from './AddInitiativeModal';
import RatingScalesModal from '../../../components/RatingScalesModal';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updatePersonalPerformance } from '../../../store/slices/personalPerformanceSlice';
import { api } from '../../../services/api';

interface PersonalQuarterlyTargetProps {
  annualTarget: AnnualTarget;
  quarter: QuarterType;
  onBack?: () => void;
  personalPerformance?: PersonalPerformance | null;
}

const PersonalQuarterlyTargetContent: React.FC<PersonalQuarterlyTargetProps> = ({
  annualTarget,
  quarter,
  onBack,
  personalPerformance = null,
}) => {
  const dispatch = useAppDispatch();
  const [selectedSupervisor, setSelectedSupervisor] = React.useState('');
  const [personalQuarterlyObjectives, setPersonalQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
  const [isAddInitiativeModalOpen, setIsAddInitiativeModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<PersonalQuarterlyTargetObjective | null>(null);
  const [selectedRatingScales, setSelectedRatingScales] = useState<AnnualTargetRatingScale[] | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<{ id: string, name: string }[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [initiativeToDelete, setInitiativeToDelete] = useState<PersonalQuarterlyTargetObjective | null>(null);
  const [status, setStatus] = useState<AgreementStatus | null>(null);

  useEffect(() => {
    fetchCompanyUsers();
  }, []);

  useEffect(() => {
    if (personalPerformance) {
      setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
      setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
      setIsSubmitted(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.agreementStatus === AgreementStatus.Submitted);
      setIsApproved(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.agreementStatus === AgreementStatus.Approved);
      setStatus(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.agreementStatus);
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

  const handleSupervisorChange = (event: SelectChangeEvent) => {
    setSelectedSupervisor(event.target.value);
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {
      if (target.quarter === quarter) {
        return {
          ...target,
          supervisorId: event.target.value,
          agreementStatus: AgreementStatus.Draft,
        }
      }

      if (quarter === 'Q1' && target.isEditable === false) {
        return {
          ...target,
          supervisorId: event.target.value,
          agreementStatus: AgreementStatus.Draft,
        }
      }
      return target;
    });

    dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      teamId: personalPerformance?.teamId || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));

    setStatus(AgreementStatus.Draft);

  };

  const handleEdit = (objective: PersonalQuarterlyTargetObjective) => {
    setEditingObjective(objective);
    setIsAddInitiativeModalOpen(true);
  };

  const handleInitiativeSave = async (data: {
    perspectiveId: number;
    objectiveName: string;
    initiative: string;
    kpis: QuarterlyTargetKPI[];
  }) => {
    const newObjective: PersonalQuarterlyTargetObjective = {
      perspectiveId: data.perspectiveId,
      name: data.objectiveName,
      initiativeName: data.initiative,
      KPIs: data.kpis,
    };

    let newPersonalQuarterlyObjectives = [...personalQuarterlyObjectives];

    if (editingObjective) {
      newPersonalQuarterlyObjectives = newPersonalQuarterlyObjectives.map(obj =>
        (obj.name === editingObjective.name &&
          obj.initiativeName === editingObjective.initiativeName &&
          obj.perspectiveId === editingObjective.perspectiveId)
          ? newObjective
          : obj
      );
      setPersonalQuarterlyObjectives(newPersonalQuarterlyObjectives);
    } else {
      newPersonalQuarterlyObjectives.push(newObjective);
      setPersonalQuarterlyObjectives(newPersonalQuarterlyObjectives);
    }

    setEditingObjective(null);
    setIsAddInitiativeModalOpen(false);
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {
      if (target.quarter === quarter) {
        return {
          ...target,
          agreementStatus: AgreementStatus.Draft,
          supervisorId: selectedSupervisor,
          objectives: newPersonalQuarterlyObjectives
        }
      }

      if (quarter === 'Q1' && target.isEditable === false) {
        return {
          ...target,
          agreementStatus: AgreementStatus.Draft,
          isEditable: calculateTotalWeight(newPersonalQuarterlyObjectives) === 100 ? true : false,
          supervisorId: selectedSupervisor,
          objectives: newPersonalQuarterlyObjectives
        }
      }
      return target;
    });

    await dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      teamId: personalPerformance?.teamId || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));
    setStatus(AgreementStatus.Draft);
  };

  const handleViewRatingScales = (kpi: QuarterlyTargetKPI) => {
    setSelectedRatingScales(kpi.ratingScales);
  };

  // Add total weight calculation function
  const calculateTotalWeight = (objectives: PersonalQuarterlyTargetObjective[]) =>   {
    return objectives.reduce((total, objective) => {
      const totalWeight = objective.KPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
      return total + totalWeight;
    }, 0);
  };

  const handleSubmit = async () => {
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {

      if (target.quarter === quarter) {
        return {
          ...target,
          agreementStatus: AgreementStatus.Submitted,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }

      if (quarter === 'Q1' && target.isEditable === false && calculateTotalWeight(personalQuarterlyObjectives) <= 100) {
        return {
          ...target,
          agreementStatus: AgreementStatus.Draft,
          isEditable: calculateTotalWeight(personalQuarterlyObjectives) === 100 ? true : false,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }

      return target;
    });

    await dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      teamId: personalPerformance?.teamId || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));

    try {
      await api.post('/notifications/agreement/submit', {
        recipientId: selectedSupervisor,
        annualTargetId: personalPerformance?.annualTargetId || '',
        quarter: quarter,
        personalPerformanceId: personalPerformance?._id || ''
      });
    } catch (error) {
      console.error('Error submitting quarterly target:', error);
    }

    setIsSubmitted(true);
    setStatus(AgreementStatus.Submitted);
  }

  // Add recall handler
  const handleRecall = async () => {
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {
      if (target.quarter === quarter) {
        return {
          ...target,
          agreementStatus: AgreementStatus.Draft,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }
      return target;
    });

    await dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      teamId: personalPerformance?.teamId || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));

    try {
      await api.post('/notifications/agreement/recall', {
        recipientId: selectedSupervisor,
        annualTargetId: personalPerformance?.annualTargetId || '',
        quarter: quarter,
        personalPerformanceId: personalPerformance?._id || ''
      });
    } catch (error) {
      console.error('Error recalling quarterly target:', error);
    }

    setIsSubmitted(false);
    setStatus(AgreementStatus.Draft);
  };

  // Add date validation function
  const isWithinPeriod = () => {
    const contractingPeriod = annualTarget.content.contractingPeriod[quarter];
    if (!contractingPeriod) return false;

    const today = new Date();
    const startDate = new Date(contractingPeriod.startDate);
    const endDate = new Date(contractingPeriod.endDate);

    return today >= startDate && today <= endDate;
  };

  // Update canEdit function to also check submission status
  const canEdit = () => {
    const quarterlyTarget = personalPerformance?.quarterlyTargets.find(target => target.quarter === quarter);
    return isWithinPeriod() &&
      quarterlyTarget?.isEditable !== false &&
      !isSubmitted && !isApproved;
  };

  // Add validation function for submit button
  const canSubmit = () => {
    return selectedSupervisor !== '' && calculateTotalWeight(personalQuarterlyObjectives) === 100 && !isApproved && canEdit();
  };

  const handleDeleteConfirm = async () => {
    if (initiativeToDelete) {
      // Update local state
      const updatedObjectives = personalQuarterlyObjectives.filter(obj =>
        !(obj.name === initiativeToDelete.name &&
          obj.initiativeName === initiativeToDelete.initiativeName &&
          obj.perspectiveId === initiativeToDelete.perspectiveId)
      );

      setPersonalQuarterlyObjectives(updatedObjectives);

      // Update Redux state
      const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {
        if (target.quarter === quarter) {
          return {
            ...target,
            objectives: updatedObjectives
          }
        }
        return target;
      });

      await dispatch(updatePersonalPerformance({
        _id: personalPerformance?._id || '',
        teamId: personalPerformance?.teamId || '',
        annualTargetId: personalPerformance?.annualTargetId || '',
        quarterlyTargets: newPersonalQuarterlyTargets || []
      }));

      setDeleteConfirmOpen(false);
      setInitiativeToDelete(null);
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
            onChange={handleSupervisorChange}
            displayEmpty
            disabled={!canEdit()}
          >
            <MenuItem value="" disabled>
              <Typography color="textSecondary">Select Supervisor</Typography>
            </MenuItem>
            {companyUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {canEdit() ? (
          <Button
            onClick={() => setIsAddInitiativeModalOpen(true)}
            variant="outlined"
            color="primary"
            sx={{
              minWidth: '100px',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Add Initiative
          </Button>
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: '#6B7280',
              fontStyle: 'italic'
            }}
          >
            Not Editable
          </Typography>
        )}

        {isApproved ? (
          <Chip
            label="Approved"
            size="medium"
            color="success"
            sx={{
              height: '30px',
              fontSize: '0.75rem'
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {
              personalQuarterlyObjectives.length > 0 &&
              <Chip
                label={status}
                size="medium"
                color={status == 'Send Back' ? 'error' : 'warning'}
                sx={{
                  height: '30px',
                  fontSize: '0.75rem'
                }}
              />
            }
            <Button
              variant="contained"
              sx={{
                backgroundColor: isSubmitted ? '#EF4444' : '#059669',
                '&:hover': {
                  backgroundColor: isSubmitted ? '#DC2626' : '#047857'
                },
                '&.Mui-disabled': {
                  backgroundColor: '#E5E7EB',
                  color: '#9CA3AF'
                }
              }}
              onClick={() => isSubmitted ? handleRecall() : handleSubmit()}
              disabled={isSubmitted ? false : !canSubmit()}
            >
              {isSubmitted ? 'Recall' : 'Submit'}
            </Button>
          </Box>
        )}
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
            color: calculateTotalWeight(personalQuarterlyObjectives) === 100 ? '#059669' : '#DC2626'
          }}
        >
          Total Weight: {calculateTotalWeight(personalQuarterlyObjectives)}%
          {calculateTotalWeight(personalQuarterlyObjectives) > 100 && (
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

      {/* Show helper text only when not submitted */}
      {!isSubmitted && !canSubmit() && (
        <Typography
          variant="caption"
          sx={{
            color: '#DC2626',
            display: 'block',
            mt: 1,
            textAlign: 'right'
          }}
        >
          {!selectedSupervisor ? 'Please select a supervisor' : 'Total weight must be 100%'}
        </Typography>
      )}

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
                <StyledHeaderCell align="center">Actions</StyledHeaderCell>
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
                            {kpiIndex === 0 && (
                              <StyledTableCell align="center" rowSpan={initiative.KPIs.length}>
                                {canEdit() ? (
                                  <Stack direction="row" spacing={1} justifyContent="center">
                                    <IconButton
                                      size="small"
                                      sx={{ color: '#6B7280' }}
                                      onClick={() => handleEdit(initiative)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      sx={{ color: '#6B7280' }}
                                      onClick={() => {
                                        setInitiativeToDelete(initiative);
                                        setDeleteConfirmOpen(true);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#6B7280',
                                      fontStyle: 'italic'
                                    }}
                                  >
                                    Not Editable
                                  </Typography>
                                )}
                              </StyledTableCell>
                            )}
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

      {isAddInitiativeModalOpen && (
        <AddInitiativeModal
          open={isAddInitiativeModalOpen}
          onClose={() => {
            setEditingObjective(null);
            setIsAddInitiativeModalOpen(false);
          }}
          annualTarget={annualTarget}
          onSave={handleInitiativeSave}
          editingObjective={editingObjective}
          personalQuarterlyObjectives={personalQuarterlyObjectives}
        />
      )}

      {selectedRatingScales && (
        <RatingScalesModal
          open={!!selectedRatingScales}
          onClose={() => setSelectedRatingScales(null)}
          ratingScales={selectedRatingScales}
        />
      )}

      {/* Add confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setInitiativeToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this objective? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setInitiativeToDelete(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default PersonalQuarterlyTargetContent;
