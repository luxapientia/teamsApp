import axios, { AxiosError } from 'axios';
import { Company, SuperUser, License } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiResponse<T> {
  data: T;
}

// Error handling interceptor
api.interceptors.response.use(
  (response) => {
    // If the response is wrapped in a data property, return as is
    // Otherwise, wrap it in a data property
    if (response.data?.data) {
      return response;
    }
    return { ...response, data: { data: response.data } };
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
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