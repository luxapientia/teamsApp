import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnnualTarget, AnnualTargetStatus, QuarterlyTarget, QuarterType } from '../../types/annualCorporateScorecard';
import { RootState } from '../index';
interface ScorecardState {
  annualTargets: AnnualTarget[];
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
        ratingScores: [
          { score: 1, name: 'Unacceptable', min: 0, max: 49, color: '#FF0000' },
          { score: 2, name: 'Room for Improvement', min: 50, max: 89, color: '#FFA500' },
          { score: 3, name: 'Target Achieved', min: 90, max: 100, color: '#008000' },
          { score: 4, name: 'High Achiever', min: 101, max: 110, color: '#0000FF' },
          { score: 5, name: 'Superior Performance', min: 111, max: 140, color: '#000080' },
        ],
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
  async (target: AnnualTarget, {getState}) => {
    // const response = await fetch(`/api/annual-targets/${target.id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(target),
    // });
    // return response.json();

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


    return newTarget;
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