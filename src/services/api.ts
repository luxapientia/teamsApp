import axios, { AxiosError } from 'axios';
import { Company, SuperUser, License } from '../types';

// Get the API URL from environment or try common development ports
export const getAPIBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL + '/api';
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

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log(`API Request to ${config.url}: Token ${token ? 'exists' : 'missing'}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // For debugging only - avoid this in production
      console.warn(`No auth token available for request to: ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add retry logic for connection errors
api.interceptors.response.use(
  (response) => {
    if (response.data?.data) {
      return response;
    }
    return { ...response, data: { data: response.data } };
  },
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status} for ${error.config.url}:`, error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.error('Unauthorized request - check token validity');
        // Only clear token and redirect if it's an auth issue, not a missing token
        if (error.response.data?.message !== 'No token provided') {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Export the api instance for use in other files
export { api };

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

