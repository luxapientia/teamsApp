import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CreateTeamPayload, Team } from '@/types/teams';
import { api } from '../../services/api';


const initialState: Team[] = [
  {
    _id: '0',
    name: 'Human Capital',
    members: [
      {
        name: 'Zorro Kar',
        title: 'Business Application Specialist',
        location: 'Head Office',
        role: 'Owner'
      },
      {
        name: 'Lorens Tar',
        title: 'IT Technician',
        location: 'Head Office',
        role: ''
      },
      {
        name: 'Maria Fernandez',
        title: 'HR Coordinator',
        location: 'Remote',
        role: ''
      }
    ]
  },
  {
    _id: '1',
    name: 'Finance',
    members: [
      {
        name: 'Alice Monroe',
        title: 'Chief Financial Officer',
        location: 'Head Office',
        role: 'Owner'
      },
      {
        name: 'James Carter',
        title: 'Financial Analyst',
        location: 'Branch Office',
        role: ''
      }
    ]
  },
  {
    _id: '2',
    name: 'Marketing',
    members: [
      {
        name: 'Emma Watson',
        title: 'Marketing Director',
        location: 'Head Office',
        role: 'Owner'
      },
      {
        name: 'Lucas Brown',
        title: 'Content Strategist',
        location: 'Remote',
        role: ''
      },
      {
        name: 'Liam Johnson',
        title: 'SEO Specialist',
        location: 'Head Office',
        role: ''
      },
      {
        name: 'Sophie Williams',
        title: 'Social Media Manager',
        location: 'Remote',
        role: ''
      }
    ]
  },
  {
    _id: '3',
    name: 'Engineering',
    members: [
      {
        name: 'Robert Dow',
        title: 'Lead Software Engineer',
        location: 'Tech Hub',
        role: 'Owner'
      },
      {
        name: 'Sophia Lane',
        title: 'Full Stack Developer',
        location: 'Remote',
        role: ''
      },
      {
        name: 'Daniel Kim',
        title: 'DevOps Engineer',
        location: 'Branch Office',
        role: ''
      },
      {
        name: 'Hannah Green',
        title: 'Frontend Developer',
        location: 'Remote',
        role: ''
      },
      {
        name: 'Ethan Wright',
        title: 'Backend Developer',
        location: 'Tech Hub',
        role: ''
      }
    ]
  },
  {
    _id: '4',
    name: 'Sales',
    members: [
      {
        name: 'Michael Smith',
        title: 'Sales Manager',
        location: 'Regional Office',
        role: 'Owner'
      },
      {
        name: 'Olivia Martinez',
        title: 'Account Executive',
        location: 'Head Office',
        role: ''
      },
      {
        name: 'Benjamin Taylor',
        title: 'Sales Representative',
        location: 'Remote',
        role: ''
      }
    ]
  }
];

export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (tenantId: string) => {
    try {
      const response = await api.get(`/teams/${tenantId}`);
      if (response.status === 200) {
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