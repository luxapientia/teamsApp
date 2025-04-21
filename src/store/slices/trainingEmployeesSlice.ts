import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { TrainingStatus } from '../../pages/employee_dev_plan/annual_org_dev_plan/plan_view';

export interface Employee {
  userId: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  team?: string;
  trainingRequested?: string;
  dateRequested?: Date;
  status: TrainingStatus;
  description?: string;
  annualTargetId: string;
  quarter: string;
}

interface TrainingEmployeesState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: TrainingEmployeesState = {
  employees: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'trainingEmployees/fetchEmployees',
  async (planId: string) => {
    const response = await api.get(`/training/${planId}/employees`);
    if (response.data.status === 'success') {
      return response.data.data.employees;
    }
    throw new Error(response.data.message || 'Failed to fetch employees');
  }
);

export const addEmployees = createAsyncThunk(
  'trainingEmployees/addEmployees',
  async ({ planId, employees }: { planId: string; employees: Employee[] }) => {
    const response = await api.post(`/training/${planId}/employees`, { employees });
    if (response.data.status === 'success') {
      return response.data.data.employees;
    }
    throw new Error(response.data.message || 'Failed to add employees');
  }
);

export const updateEmployeeStatus = createAsyncThunk(
  'trainingEmployees/updateStatus',
  async ({ 
    planId, 
    email, 
    trainingRequested, 
    status 
  }: { 
    planId: string; 
    email: string; 
    trainingRequested: string; 
    status: TrainingStatus 
  }) => {
    const response = await api.patch(`/training/${planId}/employees/${email}/status`, {
      trainingRequested,
      status
    });
    if (response.data.status === 'success') {
      return { email, trainingRequested, status };
    }
    throw new Error(response.data.message || 'Failed to update status');
  }
);

export const removeEmployee = createAsyncThunk(
  'trainingEmployees/removeEmployee',
  async ({ 
    planId, 
    email, 
    trainingRequested 
  }: { 
    planId: string; 
    email: string; 
    trainingRequested: string 
  }) => {
    await api.delete(`/training/${planId}/employees/${email}`, {
      data: { trainingRequested }
    });
    return { email, trainingRequested };
  }
);

const trainingEmployeesSlice = createSlice({
  name: 'trainingEmployees',
  initialState,
  reducers: {
    clearEmployees: (state) => {
      state.employees = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      // Add employees
      .addCase(addEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.employees = [...state.employees, ...action.payload];
      })
      // Update employee status
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        const { email, trainingRequested, status } = action.payload;
        state.employees = state.employees.map(emp => 
          emp.email === email && emp.trainingRequested === trainingRequested
            ? { ...emp, status }
            : emp
        );
      })
      // Remove employee
      .addCase(removeEmployee.fulfilled, (state, action) => {
        const { email, trainingRequested } = action.payload;
        state.employees = state.employees.filter(emp => 
          !(emp.email === email && emp.trainingRequested === trainingRequested)
        );
      });
  },
});

export const { clearEmployees } = trainingEmployeesSlice.actions;
export default trainingEmployeesSlice.reducer; 