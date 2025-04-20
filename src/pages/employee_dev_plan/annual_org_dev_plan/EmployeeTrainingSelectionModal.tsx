import React, { useEffect, useState } from 'react';
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
import { fetchTeamPerformances } from '../../../store/slices/personalPerformanceSlice';
import { fetchAnnualTargets } from '../../../store/slices/scorecardSlice';
import { useAuth } from '../../../contexts/AuthContext';
import { AssessmentStatus, PersonalPerformance } from '../../../types/personalPerformance';
import { RootState } from '../../../store';
import { TrainingStatus } from './plan_view';

interface Employee {
  userId: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  team?: string;
  trainingRequested?: string;
  dateRequested?: Date;
}

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
}

interface Course {
  name: string;
  description?: string;
}

interface EmployeeTrainingSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectEmployees: (employees: SelectedEmployee[]) => void;
  existingEmployees: Employee[];
}

const EmployeeTrainingSelectionModal: React.FC<EmployeeTrainingSelectionModalProps> = ({
  open,
  onClose,
  onSelectEmployees,
  existingEmployees
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<{ [key: string]: SelectedEmployee }>({});
  const [approvedEmployees, setApprovedEmployees] = useState<(TeamPerformance & { coursesWithQuarters: { quarter: string; courses: Course[] }[] })[]>([]);
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { teamPerformances = [], status: teamPerformancesStatus } = useAppSelector((state: RootState) => state.personalPerformance);
  const { annualTargets, status: annualTargetsStatus } = useAppSelector((state: RootState) => state.scorecard);

  useEffect(() => {
    if (open) {
      setSelectedEmployees({});
      setApprovedEmployees([]);
      dispatch(fetchAnnualTargets());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (annualTargets.length > 0) {
      annualTargets.forEach(target => {
        dispatch(fetchTeamPerformances(target._id));
      });
    }
  }, [annualTargets, dispatch]);

  useEffect(() => {
    const processedEmployees = getApprovedEmployeesWithCourses();
    setApprovedEmployees(processedEmployees);
  }, [teamPerformances, existingEmployees]);

  const getApprovedEmployeesWithCourses = () => {
    if (!Array.isArray(teamPerformances)) return [];
    
    return (teamPerformances as TeamPerformance[])
      .filter((performance) => {
        // Check if any quarter has approved courses
        return performance.quarterlyTargets.some(target => 
          target.assessmentStatus === AssessmentStatus.Approved &&
          target.personalDevelopment &&
          target.personalDevelopment.length > 0
        );
      })
      .map(performance => {
        // Get all approved courses from all quarters
        const coursesWithQuarters = performance.quarterlyTargets
          .filter(target => target.assessmentStatus === AssessmentStatus.Approved)
          .map(target => ({
            quarter: target.quarter,
            courses: target.personalDevelopment || []
          }))
          .filter(item => item.courses.length > 0);

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
        return employee.coursesWithQuarters.some(({ courses }) =>
          courses.some(course => !existingTrainings.has(course.name))
        );
      });
  };

  const isTrainingRegistered = (email: string, courseName: string) => {
    return existingEmployees.some(
      emp => emp.email === email && emp.trainingRequested === courseName
    );
  };

  const handleToggleEmployee = (performance: TeamPerformance, course: Course, quarter: string) => {
    // Skip if the training is already registered
    if (isTrainingRegistered(performance.email, course.name)) {
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

      setSelectedEmployees({
        ...selectedEmployees,
        [key]: {
          userId: typeof performance.userId === 'object' ? performance.userId._id : performance.userId,
          displayName: performance.fullName,
          email: email,
          jobTitle: performance.jobTitle || '',
          team: performance.team || '',
          trainingRequested: course.name,
          status: TrainingStatus.PLANNED,
          dateRequested: new Date(performance.updatedAt),
          description: course.description || course.name || ''
        }
      });
    }
  };

  const handleConfirm = () => {
    const formattedEmployees = Object.values(selectedEmployees)
      .filter(employee => {
        if (!employee.email) {
          return false;
        }
        return true;
      });
    
    if (formattedEmployees.length === 0) {
      return;
    }

    onSelectEmployees(formattedEmployees);
    onClose();
  };

  const isLoading = teamPerformancesStatus === 'loading' || annualTargetsStatus === 'loading';
  const hasAvailableEmployees = approvedEmployees.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Select Employees with Approved Training Courses
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
                      .filter(course => !isTrainingRegistered(employee.email, course.name))
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