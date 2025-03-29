import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnnualTarget, AnnualTargetStatus, QuarterlyTarget } from '../../types/annualCorporateScorecard';

interface ScorecardState {
  annualTargets: AnnualTarget[];
  quarterlyTargets: QuarterlyTarget[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ScorecardState = {
  annualTargets: [
    {
      id: '1',
      name: 'Annual Target 1',
      startDate: '2020-01-01',
      endDate: '2020-12-31',
      status: AnnualTargetStatus.Active,
      content: {
        perspectives: [],
        objectives: [],
        ratingScores: [],
        assesmentPeriod: {
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
      },
    }
  ],
  quarterlyTargets: [
    {
      id: '1',
      annualTargetId: '1',
      quarter: 'Q1',
      objectives: [],
      editable: false,
    },
    {
      id: '2',
      annualTargetId: '1',
      quarter: 'Q2',
      objectives: [],
      editable: false,
    },
    {
      id: '3',
      annualTargetId: '1',
      quarter: 'Q3',
      objectives: [],
      editable: false,
    },
    {
      id: '4',
      annualTargetId: '1',
      quarter: 'Q4',
      objectives: [],
      editable: false,
    }
  ],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchAnnualTargets = createAsyncThunk(
  'scorecard/fetchAnnualTargets',
  async () => {
    // Replace with your API call
    const response = await fetch('/api/annual-targets');
    return response.json();
  }
);

export const createAnnualTarget = createAsyncThunk(
  'scorecard/createAnnualTarget',
  async (target: Omit<AnnualTarget, 'id'>) => {
    // Replace with your API call
    // const response = await fetch('/api/annual-targets', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(target),
    // });
    // return response.json();
    return {
      ...target,
      id: Math.random().toString(36).substring(2, 15),
    };
  }
);

export const updateAnnualTarget = createAsyncThunk(
  'scorecard/updateAnnualTarget',
  async (target: AnnualTarget) => {
    console.log(target);
    // Replace with your API call
    // const response = await fetch(`/api/annual-targets/${target.id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(target),
    // });
    // return response.json();
    return target;
  }
);

export const deleteAnnualTarget = createAsyncThunk(
  'scorecard/deleteAnnualTarget',
  async (targetId: string) => {
    // Replace with your API call
    // await fetch(`/api/annual-targets/${targetId}`, {
    //   method: 'DELETE',
    // });
    return targetId;
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
        state.annualTargets.push(action.payload);
      })
      .addCase(updateAnnualTarget.fulfilled, (state, action) => {
        const index = state.annualTargets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.annualTargets[index] = action.payload;
        }
      })
      .addCase(deleteAnnualTarget.fulfilled, (state, action) => {
        state.annualTargets = state.annualTargets.filter(
          target => target.id !== action.payload
        );
      });
  },
});

export const { updateTargetStatus } = scorecardSlice.actions;
export default scorecardSlice.reducer; 