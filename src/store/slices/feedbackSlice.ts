import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { AxiosError } from 'axios';
import { Feedback } from '@/types';
interface FeedbackState {
    feedbacks: Feedback[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: FeedbackState = {
    feedbacks: [],
    status: 'idle',
    error: null,
};

// Async thunks
export const fetchFeedback = createAsyncThunk(
    'feedback/fetchFeedback',
    async () => {
        try {
            const response = await api.get(`/feedback`);
            console.log('response', response);
            if (response.status === 200) {
                return response.data.data as Feedback[];
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    }
);

export const createFeedback = createAsyncThunk(
    'feedback/createFeedback',
    async (feedback: Feedback) => {
        try {
            const response = await api.post('/feedback/create-feedback', feedback);
            if (response.status == 200) {
                return response.data.data as Feedback;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }
);

export const updateFeedback = createAsyncThunk(
    'feedback/updateFeedback',
    async (feedback: Feedback) => {
        try {
            const response = await api.put('/feedback/update-feedback', feedback);
            if (response.status === 200) {
                return response.data.data as Feedback;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }
);

export const deleteFeedback = createAsyncThunk(
    'feedback/deleteFeedback',
    async (feedbackId: string) => {
      // Replace with your API call
      try {
        const response = await api.delete(`/feedback/delete-feedback/${feedbackId}`);
        if (response.status === 200) {
                return feedbackId;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }
  );

const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeedback.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFeedback.fulfilled, (state, action) => {
                state.status = 'succeeded';
                console.log('action.payload', action.payload);
                state.feedbacks = action.payload;
            })
            .addCase(fetchFeedback.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch targets';
            })
            .addCase(createFeedback.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createFeedback.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (action.payload) {
                    state.feedbacks.push(action.payload);
                }
            })
            .addCase(createFeedback.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to create feedback';
            })
            .addCase(updateFeedback.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateFeedback.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (action.payload) {
                    state.feedbacks = state.feedbacks.map(feedback => feedback._id === action.payload._id ? action.payload : feedback);
                }
            })
    },
});

export default feedbackSlice.reducer;   