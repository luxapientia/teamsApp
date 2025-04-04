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

  const personalPerformances = useAppSelector((state: RootState) => state.personalPerformance.personalPerformances);
  useEffect(() => {
    if (personalPerformance) {
      setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
      setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
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
    console.log('Draft');
    console.log('personalPerformance', personalPerformance);
    const newPersonalQuarterlyTargets = personalPerformance?.quarterlyTargets.map((target: PersonalQuarterlyTarget) => {
      if(target.quarter === quarter) {
        return {
          ...target,
          isDraft: true,
          supervisorId: selectedSupervisor,
          objectives: personalQuarterlyObjectives
        }
      }
      return target;
    });
    console.log('newPersonalQuarterlyTargets', newPersonalQuarterlyTargets);
    dispatch(updatePersonalPerformance({
      _id: personalPerformance?._id || '',
      annualTargetId: personalPerformance?.annualTargetId || '',
      quarterlyTargets: newPersonalQuarterlyTargets || []
    }));

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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#F59E0B',
              '&:hover': { backgroundColor: '#D97706' },
            }}
            onClick={() => handleDraft()}
          >
            Draft
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#059669',
              '&:hover': { backgroundColor: '#047857' },
            }}
          >
            Submit
          </Button>
        </Box>
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

                // Calculate row spans
                return Object.values(groups).map(perspectiveGroup => {
                  let firstInPerspective = true;
                  const perspectiveRowSpan = Object.values(perspectiveGroup.objectives)
                    .reduce((sum, obj) => sum + obj.initiatives.length, 0);

                  return Object.values(perspectiveGroup.objectives).map(objectiveGroup => {
                    let firstInObjective = true;
                    const objectiveRowSpan = objectiveGroup.initiatives.length;

                    return objectiveGroup.initiatives.map((initiative, initiativeIndex) => {
                      const row = (
                        <TableRow key={`${initiative.perspectiveId}-${initiative.name}-${initiative.initiativeName}`}>
                          {firstInPerspective && (
                            <StyledTableCell rowSpan={perspectiveRowSpan}>
                              {perspectiveGroup.perspectiveName}
                            </StyledTableCell>
                          )}
                          {firstInObjective && (
                            <StyledTableCell rowSpan={objectiveRowSpan}>
                              {objectiveGroup.name}
                            </StyledTableCell>
                          )}
                          <StyledTableCell>
                            {initiative.initiativeName}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {initiative.KPIs[0].weight}
                          </StyledTableCell>
                          <StyledTableCell>
                            {initiative.KPIs[0].indicator}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {initiative.KPIs[0].baseline}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {initiative.KPIs[0].target}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewRatingScales(initiative.KPIs[0])}
                              sx={{
                                borderColor: '#E5E7EB',
                                color: '#374151',
                                '&:hover': {
                                  borderColor: '#D1D5DB',
                                  backgroundColor: '#F9FAFB',
                                },
                              }}
                            >
                              View
                            </Button>
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                sx={{ color: '#6B7280' }}
                                onClick={() => handleEdit(initiative)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" sx={{ color: '#6B7280' }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </StyledTableCell>
                        </TableRow>
                      );

                      if (initiativeIndex === 0) {
                        firstInObjective = false;
                      }
                      if (firstInPerspective) {
                        firstInPerspective = false;
                      }
                      return row;
                    });
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
