import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUsers = createAsyncThunk(
  'teams/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/users/organization/users');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
); 