import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CreateTeamPayload, Team } from '@/types/teams';
import { api } from '../../services/api';


const initialState: Team[] = [];

export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (tenantId: string) => {
    try {
      const response = await api.get(`/teams/${tenantId}`);
      if (response.status === 200) {
        console.log('response.data.data', response.data.data);
        return response.data.data as Team[];
      } else {
        return [];
      }
    } catch (error) {
      console.log('error', error);
      return [];
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async ({tenantId, teamName}: CreateTeamPayload) => {
    const response = await api.post('/teams', { tenantId, name: teamName });
    return response.data.data as Team;
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data.data as string;
    // await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
    // return teamId;
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTeams.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(createTeam.fulfilled, (state, action) => {
      state.push(action.payload);
    });
    builder.addCase(deleteTeam.fulfilled, (state, action) => {
      return state.filter(team => team._id !== action.payload);
    });
  },
});

export default teamsSlice.reducer;