import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { fetchTeamPerformances, clearTeamPerformances } from '../../../store/slices/personalPerformanceSlice';
import { fetchAnnualTargets } from '../../../store/slices/scorecardSlice';
import { useAuth } from '../../../contexts/AuthContext';
import { AssessmentStatus, PersonalPerformance } from '../../../types/personalPerformance';
import { RootState } from '../../../store';
import { TrainingStatus } from './plan_view';

interface UserData {
  _id: string;
  email: string;
  name: string;
}

interface TeamPerformance extends PersonalPerformance {
  fullName: string;
  jobTitle: string;
  team: string;
  email: string;
  userId: string | UserData;
  updatedAt: string;
}

interface Employee {
  userId: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  team?: string;
  trainingRequested: string;
  status: TrainingStatus;
  dateRequested: Date;
  description?: string;
  annualTargetId: string;
  quarter: string;
}

interface SelectedEmployee {
  userId: string;
  displayName: string;
  email: string;
  jobTitle: string;
  team: string;
  trainingRequested: string;
  status: TrainingStatus;
  dateRequested: Date;
  description: string;
  annualTargetId: string;
  quarter: string;
}

interface Course {
  name: string;
  description?: string;
}

interface EmployeeTrainingSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectEmployees: (employees: SelectedEmployee[]) => void;
}

const EmployeeTrainingSelectionModal: React.FC<EmployeeTrainingSelectionModalProps> = ({
  open,
  onClose,
  onSelectEmployees,
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<{ [key: string]: SelectedEmployee }>({});
  const [loadedTargetIds, setLoadedTargetIds] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { teamPerformances = [], teamPerformancesByTarget = {}, status: teamPerformancesStatus } = useAppSelector((state: RootState) => state.personalPerformance);
  const { annualTargets, status: annualTargetsStatus } = useAppSelector((state: RootState) => state.scorecard);
  const { employees: existingEmployees } = useAppSelector((state: RootState) => state.trainingEmployees);

  // Reset states and clear team performances when modal opens
  useEffect(() => {
    if (open) {
      setSelectedEmployees({});
      setLoadedTargetIds(new Set());
      dispatch(clearTeamPerformances());
      dispatch(fetchAnnualTargets());
    }
  }, [open, dispatch]);

  // Fetch team performances when annual targets are loaded
  useEffect(() => {
    if (annualTargets.length > 0) {
      annualTargets.forEach(target => {
        if (target._id && !loadedTargetIds.has(target._id)) {
          setLoadedTargetIds(prev => {
            const newSet = new Set(prev);
            newSet.add(target._id);
            return newSet;
          });
          dispatch(fetchTeamPerformances(target._id));
        }
      });
    }
  }, [annualTargets, dispatch, loadedTargetIds]);

  const approvedEmployees = useMemo(() => {
    console.log('Processing team performances:', {
      teamPerformances,
      hasQuarterlyTargets: teamPerformances.some(p => p.quarterlyTargets?.length > 0),
      approvedTargets: teamPerformances.flatMap(p => 
        p.quarterlyTargets?.filter(t => t.assessmentStatus === AssessmentStatus.Approved) || []
      )
    });

    if (!Array.isArray(teamPerformances)) return [];
    
    const processed = (teamPerformances as TeamPerformance[])
      .filter((performance) => {
        // Check if any quarter has approved courses
        const hasApprovedCourses = performance.quarterlyTargets?.some(target => 
          target.assessmentStatus === AssessmentStatus.Approved &&
          target.personalDevelopment &&
          target.personalDevelopment.length > 0
        );
        console.log('Checking performance:', {
          employee: performance.fullName,
          hasApprovedCourses,
          quarterlyTargets: performance.quarterlyTargets
        });
        return hasApprovedCourses;
      })
      .map(performance => {
        // Get all approved courses from all quarters
        const coursesWithQuarters = performance.quarterlyTargets
          ?.filter(target => {
            const isApproved = target.assessmentStatus === AssessmentStatus.Approved;
            const hasCourses = target.personalDevelopment && target.personalDevelopment.length > 0;
            console.log('Processing quarter:', {
              quarter: target.quarter,
              isApproved,
              hasCourses,
              courses: target.personalDevelopment
            });
            return isApproved && hasCourses;
          })
          .map(target => ({
            quarter: target.quarter,
            courses: target.personalDevelopment || []
          }))
          .filter(item => item.courses.length > 0) || [];

        return {
          ...performance,
          coursesWithQuarters
        };
      })
      .filter(employee => {
        // Filter out employees who have all their courses already registered
        const existingTrainings = new Set(
          existingEmployees
            .filter(e => e.email === employee.email)
            .map(e => e.trainingRequested)
        );

        // Check if there are any courses that haven't been registered yet
        const hasUnregisteredCourses = employee.coursesWithQuarters.some(({ courses }) =>
          courses.some(course => !existingTrainings.has(course.name))
        );

        console.log('Filtering employee:', {
          employee: employee.fullName,
          existingTrainings: Array.from(existingTrainings),
          hasUnregisteredCourses,
          coursesWithQuarters: employee.coursesWithQuarters
        });

        return hasUnregisteredCourses;
      });

    console.log('Processed employees:', {
      count: processed.length,
      employees: processed.map(e => ({
        name: e.fullName,
        coursesCount: e.coursesWithQuarters.reduce((acc, curr) => acc + curr.courses.length, 0)
      }))
    });

    return processed;
  }, [teamPerformances, existingEmployees]);

  const isTrainingRegistered = (email: string, courseName: string, annualTargetId: string, quarter: string) => {
    return existingEmployees.some(
      emp => emp.email === email && 
             emp.trainingRequested === courseName &&
             emp.annualTargetId === annualTargetId &&
             emp.quarter === quarter
    );
  };

  const handleToggleEmployee = (performance: TeamPerformance, course: Course, quarter: string) => {
    // Find the annual target ID for this performance
    const annualTargetId = Object.entries(teamPerformancesByTarget).find(
      ([_, performances]) => performances.some(p => p._id === performance._id)
    )?.[0];

    if (!annualTargetId) {
      console.error('Could not find annual target ID for performance:', performance);
      return;
    }

    // Skip if the training is already registered
    if (isTrainingRegistered(performance.email, course.name, annualTargetId, quarter)) {
      return;
    }

    const key = `${performance._id}-${course.name}-${quarter}`;
    
    if (selectedEmployees[key]) {
      const { [key]: removed, ...rest } = selectedEmployees;
      setSelectedEmployees(rest);
    } else {
      const email = performance.email || 
        (typeof performance.userId === 'object' ? performance.userId.email : undefined);

      if (!email) {
        return;
      }

      const newEmployee: SelectedEmployee = {
        userId: typeof performance.userId === 'object' ? performance.userId._id : performance.userId,
        displayName: performance.fullName,
        email: email,
        jobTitle: performance.jobTitle || '',
        team: performance.team || '',
        trainingRequested: course.name,
        status: TrainingStatus.PLANNED,
        dateRequested: new Date(performance.updatedAt),
        description: course.description || course.name || '',
        annualTargetId: annualTargetId,
        quarter: quarter
      };

      setSelectedEmployees(prev => ({
        ...prev,
        [key]: newEmployee
      }));
    }
  };

  const handleConfirm = () => {
    const formattedEmployees = Object.values(selectedEmployees)
      .filter(employee => employee.email);
    
    if (formattedEmployees.length === 0) {
      return;
    }

    onSelectEmployees(formattedEmployees);
    onClose();
  };

  const isLoading = teamPerformancesStatus === 'loading' || annualTargetsStatus === 'loading';
  const hasAvailableEmployees = approvedEmployees.length > 0;

  console.log('Debug Info:', {
    teamPerformancesLength: teamPerformances.length,
    approvedEmployeesLength: approvedEmployees.length,
    existingEmployeesLength: existingEmployees.length,
    isLoading,
    hasAvailableEmployees,
    loadedTargetIds: Array.from(loadedTargetIds)
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Select Employees with Approved Training Courses
        {isLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading employee data...</Typography>
          </Box>
        ) : !hasAvailableEmployees ? (
          <Typography color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
            No employees found with approved and unregistered training courses.
            {teamPerformances.length === 0 && ' (No team performances loaded)'}
            {teamPerformances.length > 0 && !teamPerformances.some(p => p.quarterlyTargets?.length > 0) && 
              ' (No quarterly targets found)'}
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Select</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Training Requested</TableCell>
                  <TableCell>Date Requested</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedEmployees.map((employee) => (
                  employee.coursesWithQuarters.map(({ quarter, courses }) => (
                    courses
                      .filter(course => !isTrainingRegistered(
                        employee.email, 
                        course.name,
                        Object.entries(teamPerformancesByTarget).find(
                          ([_, performances]) => performances.some(p => p._id === employee._id)
                        )?.[0] || '',
                        quarter
                      ))
                      .map((course: any, courseIndex: number) => (
                        <TableRow
                          key={`${employee._id}-${quarter}-${courseIndex}`}
                          hover
                          onClick={() => handleToggleEmployee(employee, course, quarter)}
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: selectedEmployees[`${employee._id}-${course.name}-${quarter}`] ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={Boolean(selectedEmployees[`${employee._id}-${course.name}-${quarter}`])}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleEmployee(employee, course, quarter);
                              }}
                            />
                          </TableCell>
                          <TableCell>{employee.fullName}</TableCell>
                          <TableCell>{employee.jobTitle}</TableCell>
                          <TableCell>{employee.team}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>
                            {new Date(employee.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                  ))
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              color: '#d92d20',
              borderColor: '#d92d20',
              '&:hover': {
                borderColor: '#b42318',
                backgroundColor: 'rgba(217, 45, 32, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!hasAvailableEmployees || Object.keys(selectedEmployees).length === 0}
            sx={{
              backgroundColor: '#0078D4',
              '&:hover': {
                backgroundColor: '#106EBE',
              },
            }}
          >
            Add Selected
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeTrainingSelectionModal; 
