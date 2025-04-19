import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface DevelopmentPlan {
  _id: string;
  name: string;
  tenantId: string;
  trainings: any[];
}

interface DevPlanState {
  plans: DevelopmentPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: DevPlanState = {
  plans: [],
  loading: false,
  error: null
};

// Async thunks
export const fetchDevPlans = createAsyncThunk(
  'devPlan/fetchDevPlans',
  async (tenantId: string) => {
    const response = await api.get(`/users/org-dev-plan/${tenantId}`);
    return response.data.data;
  }
);

export const createDevPlan = createAsyncThunk(
  'devPlan/createDevPlan',
  async ({ name, tenantId }: { name: string; tenantId: string }) => {
    const response = await api.post('/users/org-dev-plan', { name, tenantId });
    return response.data.data;
  }
);

export const deleteDevPlan = createAsyncThunk(
  'devPlan/deleteDevPlan',
  async (planId: string) => {
    await api.delete(`/users/org-dev-plan/${planId}`);
    return planId;
  }
);

export const updateDevPlan = createAsyncThunk(
  'devPlan/updateDevPlan',
  async ({ planId, name }: { planId: string; name: string }) => {
    const response = await api.put(`/users/org-dev-plan/${planId}`, { name });
    return response.data.data;
  }
);

const devPlanSlice = createSlice({
  name: 'devPlan',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch plans
      .addCase(fetchDevPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchDevPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch plans';
      })
      // Create plan
      .addCase(createDevPlan.fulfilled, (state, action) => {
        state.plans.unshift(action.payload);
      })
      // Delete plan
      .addCase(deleteDevPlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter(plan => plan._id !== action.payload);
      })
      // Update plan
      .addCase(updateDevPlan.fulfilled, (state, action) => {
        const index = state.plans.findIndex(plan => plan._id === action.payload._id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      });
  }
});

export default devPlanSlice.reducer; 