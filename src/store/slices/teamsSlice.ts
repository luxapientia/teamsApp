import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CreateTeamPayload, Team } from '@/types/teams';
import { api } from '../../services/api';

// Enhanced interface to include members and loading states
interface TeamsState {
  teams: Team[];
  teamMembers: { [teamId: string]: any[] };
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  teamMembers: {},
  loading: false,
  error: null
};

// Fetch all teams for a tenant
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

// Fetch all team members for all teams in a tenant
export const fetchAllTeamMembers = createAsyncThunk(
  'teams/fetchAllTeamMembers',
  async (tenantId: string) => {
    try {
      const response = await api.get(`/users/tenant/${tenantId}`);
      if (response.status === 200) {
        const allUsers = response.data.data || [];
        
        // Group users by teamId
        const teamMembersMap: { [teamId: string]: any[] } = {};
        
        allUsers.forEach((user: any) => {
          if (user.teamId) {
            if (!teamMembersMap[user.teamId]) {
              teamMembersMap[user.teamId] = [];
            }
            teamMembersMap[user.teamId].push(user);
          }
        });
        
        return teamMembersMap;
      } else {
        return {};
      }
    } catch (error) {
      console.error('Error fetching all team members:', error);
      return {};
    }
  }
);

// Fetch members for a specific team
export const fetchTeamMembers = createAsyncThunk(
  'teams/fetchTeamMembers',
  async (teamId: string) => {
    try {
      const response = await api.get(`/users/team/${teamId}`);
      if (response.status === 200) {
        return { 
          teamId,
          members: response.data.data || []
        };
      } else {
        return { teamId, members: [] };
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      return { teamId, members: [] };
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
    // Fetch teams cases
    builder.addCase(fetchTeams.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTeams.fulfilled, (state, action) => {
      state.teams = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchTeams.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch teams';
    });
    
    // Fetch all team members cases
    builder.addCase(fetchAllTeamMembers.fulfilled, (state, action) => {
      state.teamMembers = action.payload;
    });
    
    // Fetch specific team members cases
    builder.addCase(fetchTeamMembers.fulfilled, (state, action) => {
      const { teamId, members } = action.payload;
      state.teamMembers[teamId] = members;
    });
    
    // Create team cases
    builder.addCase(createTeam.fulfilled, (state, action) => {
      state.teams.push(action.payload);
    });
    
    // Delete team cases
    builder.addCase(deleteTeam.fulfilled, (state, action) => {
      state.teams = state.teams.filter(team => team._id !== action.payload);
      // Clean up members for the deleted team
      if (state.teamMembers[action.payload]) {
        delete state.teamMembers[action.payload];
      }
    });
  },
});

export default teamsSlice.reducer;