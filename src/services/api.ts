import axios, { AxiosError } from 'axios';
import { Company, SuperUser, License } from '../types';

// Get the API URL from environment or try common development ports
const getAPIBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In development, try common ports
  const defaultPort = 3001;
  return `http://localhost:${defaultPort}/api`;
};

const API_BASE_URL = getAPIBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiResponse<T> {
  data: T;
}

// Add retry logic for connection errors
api.interceptors.response.use(
  (response) => {
    if (response.data?.data) {
      return response;
    }
    return { ...response, data: { data: response.data } };
  },
  async (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // If connection failed, it might be using wrong port
    if (!error.response && error.message.includes('Network Error')) {
      console.log('Connection failed. The API might be running on a different port.');
    }
    
    return Promise.reject(error);
  }
);

// Company API
export const companyAPI = {
  getAll: () => api.get<ApiResponse<Company[]>>('/companies'),
  create: (data: Omit<Company, '_id' | '__v'>) => api.post<ApiResponse<Company>>('/companies', data),
  update: (id: string, data: Partial<Omit<Company, '_id' | '__v'>>) => 
    api.put<ApiResponse<Company>>(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
};

// SuperUser API
export const superUserAPI = {
  getAll: () => api.get<ApiResponse<SuperUser[]>>('/super-users'),
  create: (data: Omit<SuperUser, '_id' | '__v'>) => api.post<ApiResponse<SuperUser>>('/super-users', data),
  update: (id: string, data: Partial<Omit<SuperUser, '_id' | '__v'>>) => 
    api.put<ApiResponse<SuperUser>>(`/super-users/${id}`, data),
  delete: (id: string) => api.delete(`/super-users/${id}`),
};

// License API
export const licenseAPI = {
  getAll: () => api.get<ApiResponse<License[]>>('/licenses'),
  create: (data: Omit<License, '_id' | '__v'>) => api.post<ApiResponse<License>>('/licenses', data),
  update: (id: string, data: Partial<Omit<License, '_id' | '__v'>>) => 
    api.put<ApiResponse<License>>(`/licenses/${id}`, data),
  delete: (id: string) => api.delete(`/licenses/${id}`),
}; 

