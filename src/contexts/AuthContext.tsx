import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getAPIBaseURL } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  user: any | null;
  loading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = getAPIBaseURL();

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      const response = await authApi.get('/auth/profile', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If token is invalid, logout
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async () => {
    try {
      console.log('Making login request to:', `${API_BASE_URL}/auth/login`);
      const response = await authApi.get('/auth/login');
      console.log('Login response:', response.data);
      
      // Handle both string and object responses
      const loginUrl = typeof response.data === 'string' 
        ? response.data 
        : response.data?.url;
      
      if (loginUrl) {
        window.location.href = loginUrl;
      } else {
        console.error('Login response missing URL:', response.data);
        throw new Error('No login URL received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      login, 
      logout, 
      user,
      loading,
      setIsAuthenticated,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 