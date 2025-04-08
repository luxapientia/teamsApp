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

// Add these new action creators for team owner operations
export const fetchTeamOwner = createAsyncThunk(
  'teams/fetchTeamOwner',
  async (teamId: string) => {
    try {
      const response = await api.get(`/teams/${teamId}/owner`);
      if (response.status === 200) {
        return { 
          teamId,
          owner: response.data.data 
        };
      } else {
        return { teamId, owner: null };
      }
    } catch (error) {
      console.error('Error fetching team owner:', error);
      return { teamId, owner: null };
    }
  }
);

export const setTeamOwner = createAsyncThunk(
  'teams/setTeamOwner',
  async ({ teamId, userId }: { teamId: string, userId: string }) => {
    try {
      const response = await api.put(`/teams/${teamId}/owner/${userId}`);
      if (response.status === 200) {
        // After setting the owner, fetch their details
        const ownerResponse = await api.get(`/teams/${teamId}/owner`);
        if (ownerResponse.status === 200) {
          return { 
            teamId, 
            owner: ownerResponse.data.data 
          };
        }
      }
      return { teamId, owner: null };
    } catch (error) {
      console.error('Error setting team owner:', error);
      return { teamId, owner: null };
    }
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
    
    // Add team owner cases
    builder.addCase(fetchTeamOwner.fulfilled, (state, action) => {
      const { teamId, owner } = action.payload;
      // Find the team and update its owner
      const team = state.teams.find(t => t._id === teamId);
      if (team) {
        team.owner = owner;
      }
    });
    
    builder.addCase(setTeamOwner.fulfilled, (state, action) => {
      const { teamId, owner } = action.payload;
      // Find the team and update its owner
      const team = state.teams.find(t => t._id === teamId);
      if (team) {
        team.owner = owner;
      }
    });
  },
});

export default teamsSlice.reducer;