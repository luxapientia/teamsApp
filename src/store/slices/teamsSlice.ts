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
    ]
  },
  {
    id: '1',
    name: 'Finance',
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

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createTeam.fulfilled, (state, action) => {
      state.push(action.payload);
    });
  },
});

export default teamsSlice.reducer;