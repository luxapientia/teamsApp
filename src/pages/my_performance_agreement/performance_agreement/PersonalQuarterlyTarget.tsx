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
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, AnnualTargetPerspective, QuarterlyTargetKPI, AnnualTargetRatingScale } from '@/types/annualCorporateScorecard';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective, PersonalPerformance, PersonalQuarterlyTarget } from '@/types/personalPerformance';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddInitiativeModal from './AddInitiativeModal';
import RatingScalesModal from '../../../components/RatingScalesModal';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updatePersonalPerformance } from '../../../store/slices/personalPerformanceSlice';
import { RootState } from '../../../store';
import { api } from '../../../services/api';
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
  personalPerformance?: PersonalPerformance | null;
}

const PersonalQuarterlyTargetContent: React.FC<PersonalQuarterlyTargetProps> = ({
  annualTarget,
  quarter,
  onBack,
  supervisors = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ],
  onSupervisorChange = () => { },
  personalPerformance = null,
}) => {
  const dispatch = useAppDispatch();
  const [selectedSupervisor, setSelectedSupervisor] = React.useState('');
  const [personalQuarterlyObjectives, setPersonalQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
  const [isAddInitiativeModalOpen, setIsAddInitiativeModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<PersonalQuarterlyTargetObjective | null>(null);
  const [selectedRatingScales, setSelectedRatingScales] = useState<AnnualTargetRatingScale[] | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const personalPerformances = useAppSelector((state: RootState) => state.personalPerformance.personalPerformances);
  useEffect(() => {
    if (personalPerformance) {
      setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
      setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
      setIsSubmitted(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.isAgreementDraft === false);
    }
  }, [personalPerformance]);

  const handleSupervisorChange = (event: SelectChangeEvent) => {
    setSelectedSupervisor(event.target.value);
    onSupervisorChange(event.target.value);
  };

  const handleEdit = (objective: PersonalQuarterlyTargetObjective) => {
    setEditingObjective(objective);
    setIsAddInitiativeModalOpen(true);
  };

  const handleInitiativeSave = (data: {
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

    if (editingObjective) {
      setPersonalQuarterlyObjectives(prevObjectives =>
        prevObjectives.map(obj =>
          (obj.name === editingObjective.name &&
            obj.initiativeName === editingObjective.initiativeName &&
            obj.perspectiveId === editingObjective.perspectiveId)
            ? newObjective
            : obj
        )
      );
    } else {
      setPersonalQuarterlyObjectives(prev => [...prev, newObjective]);
    }

    setEditingObjective(null);
    setIsAddInitiativeModalOpen(false);
  };

  const handleViewRatingScales = (kpi: QuarterlyTargetKPI) => {
    setSelectedRatingScales(kpi.ratingScales);
  };

  const handleDraft = () => {
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {

      if (target.quarter === quarter) {
        return {
          ...target,
          isAgreementDraft: true,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }

      if (quarter === 'Q1' && target.isEditable === false && calculateTotalWeight() <= 100) {
        return {
          ...target,
          isAgreementDraft: true,
          isEditable: calculateTotalWeight() === 100 ? true : false,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }

      }
      return target;
    });

    dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));

  };

  // Add total weight calculation function
  const calculateTotalWeight = () => {
    return personalQuarterlyObjectives.reduce((total, objective) => {
      const totalWeight = objective.KPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
      return total + totalWeight;
    }, 0);
  };

  const handleSubmit = async () => {
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {

      if (target.quarter === quarter) {
        return {
          ...target,
          isAgreementDraft: false,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }

      if (quarter === 'Q1' && target.isEditable === false && calculateTotalWeight() <= 100) {
        return {
          ...target,
          isAgreementDraft: true,
          isEditable: calculateTotalWeight() === 100 ? true : false,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }

      return target;
    });

    await dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));

    try {
      await api.post('/notifications/quarterly-target/submit', {
        recipientId: selectedSupervisor,
        annualTargetId: personalPerformance?.annualTargetId || '',
        quarter: quarter
      });
    } catch (error) {
      console.error('Error submitting quarterly target:', error);
    }

    setIsSubmitted(true);
  }

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
      !isSubmitted;
  };

  // Add validation function for submit button
  const canSubmit = () => {
    return selectedSupervisor !== '' && calculateTotalWeight() === 100;
  };

  // Add recall handler
  const handleRecall = async () => {
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {
      if (target.quarter === quarter) {
        return {
          ...target,
          isAgreementDraft: true,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }
      return target;
    });

    await dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));

    setIsSubmitted(false);
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
          >
            <MenuItem value="" disabled>
              <Typography color="textSecondary">Select Supervisor</Typography>
            </MenuItem>
            {supervisors.map((supervisor) => (
              <MenuItem key={supervisor.id} value={supervisor.id}>
                {supervisor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {canEdit() ? (
          <Button
            startIcon={<AddIcon />}
            onClick={() => setIsAddInitiativeModalOpen(true)}
            sx={{
              color: '#6B7280',
              '&:hover': {
                backgroundColor: '#F9FAFB',
              },
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: isSubmitted ? '#9CA3AF' : '#F59E0B',
              '&:hover': {
                backgroundColor: isSubmitted ? '#9CA3AF' : '#D97706'
              },
              cursor: isSubmitted ? 'default' : 'pointer'
            }}
            disabled={isSubmitted}
            onClick={() => handleDraft()}
          >
            {isSubmitted ? 'Submitted' : 'Draft'}
          </Button>
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
            disabled={!isSubmitted && !canSubmit()}
          >
            {isSubmitted ? 'Recall' : 'Submit'}
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
                                        if (window.confirm('Are you sure you want to delete this objective?')) {
                                          setPersonalQuarterlyObjectives(prev =>
                                            prev.filter(obj =>
                                              !(obj.name === initiative.name &&
                                                obj.initiativeName === initiative.initiativeName &&
                                                obj.perspectiveId === initiative.perspectiveId)
                                            )
                                          );
                                        }
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
    </Box >
  );
};

export default PersonalQuarterlyTargetContent;
