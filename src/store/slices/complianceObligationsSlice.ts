import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Obligation } from '../../types/compliance';

interface ComplianceObligationsState {
    obligations: Obligation[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ComplianceObligationsState = {
    obligations: [],
    status: 'idle',
    error: null
};

export const fetchComplianceObligations = createAsyncThunk(
    'complianceObligations/fetchAll',
    async () => {
        const response = await api.get('/compliance-obligations');
        return response.data.data;
    }
);

export const submitQuarterlyUpdates = createAsyncThunk(
    'complianceObligations/submitQuarterlyUpdates',
    async ({ obligationIds, year, quarter, status }: { 
        obligationIds: string[], 
        year: string, 
        quarter: string, 
        status: string 
    }) => {
        const response = await api.post('/compliance-obligations/submit-quarterly-updates', {
            obligationIds,
            year,
            quarter,
            status
        });
        return response.data;
    }
);

const complianceObligationsSlice = createSlice({
    name: 'complianceObligations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchComplianceObligations.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchComplianceObligations.fulfilled, (state, action: PayloadAction<Obligation[]>) => {
                state.status = 'succeeded';
                state.obligations = action.payload;
            })
            .addCase(fetchComplianceObligations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch obligations';
            })
            .addCase(submitQuarterlyUpdates.fulfilled, (state) => {
                // After successful submission, we'll refetch the obligations
                state.status = 'idle';
            });
    }
});

export default complianceObligationsSlice.reducer; 