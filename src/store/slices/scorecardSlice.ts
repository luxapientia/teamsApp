import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnnualTarget, AnnualTargetStatus, QuarterlyTarget, QuarterType } from '../../types/annualCorporateScorecard';
import { RootState } from '../index';
import { api } from '../../services/api';
import { AxiosError } from 'axios';
interface ScorecardState {
  annualTargets: AnnualTarget[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ScorecardState = {
  annualTargets: [
    {
      _id: '1',
      name: 'Annual Target 1',
      startDate: '2020-01-01',
      endDate: '2020-12-31',
      status: AnnualTargetStatus.Active,
      content: {
        perspectives: [],
        objectives: [],
        ratingScales: [
          { score: 1, name: 'Unacceptable', min: '0', max: '49', color: '#FF0000' },
          { score: 2, name: 'Room for Improvement', min: '50', max: '89', color: '#FFA500' },
          { score: 3, name: 'Target Achieved', min: '90', max: '100', color: '#008000' },
          { score: 4, name: 'High Achiever', min: '101', max: '110', color: '#0000FF' },
          { score: 5, name: 'Superior Performance', min: '111', max: '140', color: '#000080' },
        ],
        assessmentPeriod: {
          Q1: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
          Q2: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
          Q3: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
          Q4: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
        },
        contractingPeriod: {
          Q1: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
          Q2: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
          Q3: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
          Q4: {
            startDate: '2020-01-01',
            endDate: '2020-12-31',
          },
        },
        totalWeight: 0,
        quarterlyTarget: {
          editable: false,
          quarterlyTargets: [
            {
              quarter: 'Q1',
              objectives: []
            },
            {
              quarter: 'Q2',
              objectives: []
            },
            {
              quarter: 'Q3',
              objectives: []
            },
            {
              quarter: 'Q4',
              objectives: []
            },
          ],
        },
      },
    }
  ],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchAnnualTargets = createAsyncThunk(
  'scorecard/fetchAnnualTargets',
  async () => {
    try {
      const response = await api.get('/score-card/annual-targets');
      if (response.status === 200) {
        return response.data.data as AnnualTarget[];
      } else {
        return [];
      }
    } catch (error) {
      console.log('error', error);
      return [];
    }
  }
);

export const createAnnualTarget = createAsyncThunk(
  'scorecard/createAnnualTarget',
  async (target: Omit<AnnualTarget, '_id'>) => {
    try {
      // Replace with your API call
      const response = await api.post('/score-card/create-annual-target', {
        annualTarget: target,
      });

      if (response.status === 200) {
        return response.data.data as AnnualTarget;
      } else {

      }
    } catch (error) {
      console.log('error', error);
    }
  }
);

export const updateAnnualTarget = createAsyncThunk(
  'scorecard/updateAnnualTarget',
  async (target: AnnualTarget) => {
    try {
      const newTarget = {
        ...target,
        content: {
          ...target.content,
          quarterlyTarget: {
            ...target.content.quarterlyTarget,
            quarterlyTargets: target?.content.quarterlyTarget.editable ? (target?.content.quarterlyTarget.quarterlyTargets) :
              ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => ({
                quarter: quarter as QuarterType,
                objectives: [...target.content.objectives]
              }))
          }
        }
      };

      const response = await api.put(`/score-card/update-annual-target/${target._id}`, {
        annualTarget: newTarget,
      });

      if (response.status === 200) {
        return response.data.data as AnnualTarget;
      } else {

      }
    } catch (error) {
      console.log('error', error);
    }
  }
);

export const deleteAnnualTarget = createAsyncThunk(
  'scorecard/deleteAnnualTarget',
  async (targetId: string) => {
    // Replace with your API call
    try {
      const response = await api.delete(`/score-card/delete-annual-target/${targetId}`);
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

const scorecardSlice = createSlice({
  name: 'scorecard',
  initialState,
  reducers: {
    updateTargetStatus(
      state,
      action: PayloadAction<{ name: string; status: AnnualTargetStatus }>
    ) {
      const target = state.annualTargets.find(t => t.name === action.payload.name);
      if (target) {
        target.status = action.payload.status;
      }
    },
    updateQuarterlyTarget(
      state,
      action: PayloadAction<AnnualTarget>
    ) {
      const index = state.annualTargets.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.annualTargets[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnualTargets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAnnualTargets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.annualTargets = action.payload;
      })
      .addCase(fetchAnnualTargets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch targets';
      })
      .addCase(createAnnualTarget.fulfilled, (state, action) => {
        if (action.payload) {
          state.annualTargets.push(action.payload);
        }
      })
      .addCase(updateAnnualTarget.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          const id = action.payload._id;
          const index = state.annualTargets.findIndex(t => t._id === id);
          if (index !== -1) {
            state.annualTargets[index] = action.payload;
          }
        }
      })
      .addCase(deleteAnnualTarget.fulfilled, (state, action) => {
        state.annualTargets = state.annualTargets.filter(
          target => target._id !== action.payload
        );
      });
  },
});

export const { updateTargetStatus, updateQuarterlyTarget } = scorecardSlice.actions;
export default scorecardSlice.reducer; 