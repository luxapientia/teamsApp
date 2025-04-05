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
import KPIModal from './KPIModal';

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<{ kpi: QuarterlyTargetKPI, perspectiveId: number, objectiveName: string, initiativeName: string, kpiIndex: number } | null>(null);
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
    const assessmentPeriod = annualTarget.content.assessmentPeriod[quarter];
    if (!assessmentPeriod) return false;

    const today = new Date();
    const startDate = new Date(assessmentPeriod.startDate);
    const endDate = new Date(assessmentPeriod.endDate);

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

  const handleSave = (newKPI: QuarterlyTargetKPI) => {
    if (selectedKPI) {
      const newPersonalQuarterlyObjectives = personalQuarterlyObjectives.map(objective => {
        if (objective.perspectiveId === selectedKPI.perspectiveId && objective.name === selectedKPI.objectiveName && objective.initiativeName === selectedKPI.initiativeName) {
          return {
            ...objective,
            KPIs: objective.KPIs.map((kpi, kpiIndex) => kpiIndex === selectedKPI.kpiIndex ? newKPI : kpi)
          }
        }
        return objective;
      })



      setPersonalQuarterlyObjectives(newPersonalQuarterlyObjectives);
      setSelectedKPI(null);
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
            disabled={true}
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                <StyledHeaderCell align="center">Actual Achieved</StyledHeaderCell>
                <StyledHeaderCell align="center">Performance Rating Scale</StyledHeaderCell>
                <StyledHeaderCell align="center">Evidence</StyledHeaderCell>
                <StyledHeaderCell align="center">Access</StyledHeaderCell>
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
                            <StyledTableCell align="center">
                              {kpi.ratingScore}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {kpi.evidence && (
                                <IconButton
                                  size="small"
                                  // onClick={() => setEvidenceModalData({
                                  //   evidence: kpi.evidence,
                                  //   attachments: kpi.attachments
                                  // })}
                                  sx={{ color: '#6B7280' }}
                                >
                                  <DescriptionIcon />
                                </IconButton>
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <AccessButton
                                size="small"
                                onClick={() => {
                                  setSelectedKPI({
                                    kpi: kpi,
                                    kpiIndex: kpiIndex,
                                    perspectiveId: perspectiveGroup.perspectiveId,
                                    objectiveName: objectiveGroup.name,
                                    initiativeName: initiative.initiativeName
                                  });
                                }}
                              >
                                Evaluate
                              </AccessButton>
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
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>

      </Box>

      {selectedKPI && (
        <KPIModal
          open={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
          onSave={handleSave}
          selectedKPI={selectedKPI.kpi}
          annualTargetId={personalPerformance?.annualTargetId || ''}
          quarter={quarter}
        />
      )}
    </Box >
  );
};

export default PersonalQuarterlyTargetContent;
