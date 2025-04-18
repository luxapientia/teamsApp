import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { AxiosError } from 'axios';
import { PersonalPerformance, TeamPerformance } from '@/types';
interface PersonalPerformanceState {
  personalPerformances: PersonalPerformance[];
  teamPerformances: TeamPerformance[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PersonalPerformanceState = {
  personalPerformances: [],
  teamPerformances: [],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchPersonalPerformances = createAsyncThunk(
  'personalPerformance/fetchPersonalPerformances',
  async (payload: { annualTargetId: string, quarter: string }) => {
    try {
      const response = await api.get(`/personal-performance/personal-performances`, {
        params: {
          annualTargetId: payload.annualTargetId,
          quarter: payload.quarter
        }
      });

      if (response.status === 200) {
        return response.data.data as PersonalPerformance[];
      } else {
        return [];
      }
    } catch (error) {
      console.log('error', error);
      return [];
    }
  }
);

export const fetchTeamPerformances = createAsyncThunk(
  'personalPerformance/fetchTeamPerformances',
  async (annualTargetId: string) => {
    try {
      const response = await api.get(`/personal-performance/team-performances`, {
        params: {
          annualTargetId: annualTargetId
        }
      });
      if (response.status === 200) {
        return response.data.data as TeamPerformance[];
      } else {
        return [];
      }
    } catch (error) {
      console.log('error', error);
      return [];
    }
  }
);

export const createPersonalPerformance = createAsyncThunk(
  'personalPerformance/createPersonalPerformance',
  async (target: Omit<PersonalPerformance, '_id'>) => {
    try {
      // Replace with your API call
      const response = await api.post('/personal-performance/create-personal-performance', {
        personalPerformance: target,
      });

      if (response.status === 200) {
        return response.data.data as PersonalPerformance;
      } else {

      }
    } catch (error) {
      console.log('error', error);
    }
  }
);

export const updatePersonalPerformance = createAsyncThunk(
  'personalPerformance/updatePersonalPerformance',
  async (target: PersonalPerformance) => {
    try {
      const response = await api.put(`/personal-performance/update-personal-performance/${target._id}`, {
        personalPerformance: target
      });
      if (response.status === 200) {
        return response.data.data as PersonalPerformance;
      } else {
      }
    } catch (error) {
      console.log('error', error);
    }
  }
);

export const deletePersonalPerformance = createAsyncThunk(
  'personalPerformance/deletePersonalPerformance',
  async (targetId: string) => {
    // Replace with your API call
    try {
      const response = await api.delete(`/personal-performance/delete-personal-performance/${targetId}`);
      if (response.status === 200) {
        return targetId;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
);

const personalPerformanceSlice = createSlice({
  name: 'personalPerformance',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonalPerformances.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPersonalPerformances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log('action.payload', action.payload);
        state.personalPerformances = action.payload;
      })
      .addCase(fetchPersonalPerformances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch targets';
      })
      .addCase(fetchTeamPerformances.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTeamPerformances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.teamPerformances = action.payload;
      })
      .addCase(createPersonalPerformance.fulfilled, (state, action) => {
        // if (action.payload) {
        //   state.personalPerformance.push(action.payload);
        // }
      })
      .addCase(updatePersonalPerformance.fulfilled, (state, action) => {
        if (action.payload) {
          state.personalPerformances = state.personalPerformances.map(personalPerformance =>
            personalPerformance._id === action.payload?._id ? action.payload : personalPerformance
          ) as PersonalPerformance[];
        }
      })
      .addCase(deletePersonalPerformance.fulfilled, (state, action) => {
        // state.personalPerformance = state.personalPerformance.filter(
        //   target => target._id !== action.payload
        // );
      });
  },
});

export default personalPerformanceSlice.reducer; 