import { AnnualTarget } from '@/types';
import { Team } from '@/types/teams';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: Team[] = [
  {
    id: '0',
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
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
  async () => {
    // Replace with your API call
    const response = await fetch('/api/teams');
    return response.json();
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamName: string) => {
    return {
      name: teamName,
      members: [],
      id: Math.random().toString(36).substring(2, 15),
    };
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string) => {
    // Simulate an API call or perform any async operation if needed
    return teamId;
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createTeam.fulfilled, (state, action) => {
      state.push(action.payload);
    });
    builder.addCase(deleteTeam.fulfilled, (state, action) => {
      return state.filter(team => team.id !== action.payload);
    });
  },
});

export default teamsSlice.reducer;