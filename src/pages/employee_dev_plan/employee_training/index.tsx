import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Button,
} from '@mui/material';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { TrainingStatus } from '../annual_org_dev_plan/plan_view';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { fetchAnnualTargets } from '../../../store/slices/scorecardSlice';
import { RootState } from '../../../store';

interface OrgDevPlan {
  _id: string;
  name: string;
  year: number;
}

interface Employee {
  microsoftId: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  team?: string;
  trainingRequested: string;
  dateRequested: Date;
  status: TrainingStatus;
  annualTargetId: string;
  quarter: string;
}

const EmployeesTraining: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [plans, setPlans] = useState<OrgDevPlan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { annualTargets } = useAppSelector((state: RootState) => state.scorecard);

  useEffect(() => {
    fetchPlans();
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlan) {
      fetchEmployees(selectedPlan);
    } else {
      setEmployees([]);
    }
  }, [selectedPlan]);

  const fetchPlans = async () => {
    try {
      const response = await api.get(`/users/org-dev-plan/${user?.tenantId}`);
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setPlans(response.data.data);
      } else {
        setPlans([]);
      }
    } catch (error) {
      showToast('Failed to fetch plans', 'error');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    fetchEmployees(selectedPlan);
    setIsTableVisible(true);
  };

  const fetchEmployees = async (planId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/training/${planId}/employees`);
      if (response.data.status === 'success') {
        setEmployees(response.data.data.employees);
      }
    } catch (error) {
      showToast('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (employees.length === 0) return 0;
    const completedTrainings = employees.filter(emp => emp.status === TrainingStatus.COMPLETED).length;
    return Math.round((completedTrainings / employees.length) * 100);
  };

  const getAnnualTargetName = (targetId: string) => {
    const target = annualTargets.find(t => t._id === targetId);
    return target?.name || '-';
  };

  if (loading && !selectedPlan) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  console.log(plans, 'plans')
  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <Select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            displayEmpty
            sx={{ backgroundColor: '#fff' }}
          >
            <MenuItem value="">
              <Typography color="textSecondary">Select a development plan</Typography>
            </MenuItem>
            {plans?.map((plan) => (
              <MenuItem key={plan._id} value={plan._id}>
                {plan.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleView}
          disabled={!selectedPlan}
          sx={{
            backgroundColor: '#0078D4',
            '&:hover': { backgroundColor: '#106EBE' },
          }}
        >
          View
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'right', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : isTableVisible ? (
        <>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1, 
              maxWidth: '300px',
              marginLeft: 'auto'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">Implementation Progress</Typography>
                <Typography variant="body2" color="textSecondary">{calculateProgress()}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0, 120, 212, 0.12)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#0078D4',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Full Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Training/Course</TableCell>
                  <TableCell>Annual Target</TableCell>
                  <TableCell>Quarter</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">No employees found in this plan</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={`${employee.email}-${employee.trainingRequested}-${employee.annualTargetId}-${employee.quarter}`}>
                      <TableCell>{employee.displayName}</TableCell>
                      <TableCell>{employee.jobTitle || '-'}</TableCell>
                      <TableCell>{employee.team || '-'}</TableCell>
                      <TableCell>{employee.trainingRequested}</TableCell>
                      <TableCell>{getAnnualTargetName(employee.annualTargetId)}</TableCell>
                      <TableCell>{employee.quarter || '-'}</TableCell>
                      <TableCell>{employee.status === TrainingStatus.COMPLETED ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </Box>
  );
};

export default EmployeesTraining;
