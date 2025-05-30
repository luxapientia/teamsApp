import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isInTeams, initializeTeams } from '../utils/teamsUtils';
import * as microsoftTeams from '@microsoft/teams-js';
import { authConfig } from '../config/authConfig';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile;
  isTeams: boolean;
  isTeamsInitialized: boolean;
  hasLicenseError: boolean;
  licenseStatus: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: UserProfile) => void;
  setIsLoading: (value: boolean) => void;
  setHasLicenseError: (value: boolean) => void;
  setLicenseStatus: (status: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Setup API interceptor for license errors
const setupApiInterceptors = (
  setHasLicenseError: (value: boolean) => void,
  setLicenseStatus: (status: string | null) => void,
  navigate: (path: string) => void
) => {
  // Add a response interceptor
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        // Handle license errors (403 responses with licenseError flag)
        if (
          error.response.status === 403 &&
          error.response.data &&
          error.response.data.licenseError
        ) {
          setHasLicenseError(true);
          setLicenseStatus(error.response.data.licenseStatus || null);
          navigate('/license-error');
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isTeams, setIsTeams] = useState(false);
  const [isTeamsInitialized, setIsTeamsInitialized] = useState(false);
  const [hasLicenseError, setHasLicenseError] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  // Setup API interceptors for license errors
  useEffect(() => {
    setupApiInterceptors(setHasLicenseError, setLicenseStatus, navigate);
  }, [navigate]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const teamsCheck = isInTeams();
      setIsTeams(teamsCheck);

      // Check for existing token in sessionStorage
      const existingToken = sessionStorage.getItem('auth_token');
      
      if (existingToken) {
        try {
          // Validate the token with the server
          const response = await api.get('/auth/verify');
          const userData = response.data.data;
          // Token is valid, update auth state
          setUser(userData.user);
          setIsAuthenticated(true);
          } catch (error) {
          console.error('Error validating existing token:', error);
          // Token validation failed, clear it
          sessionStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }

      if (teamsCheck) {
        try {
          await initializeTeams();
          setIsTeamsInitialized(true);
        } catch (error) {
          console.error('Teams initialization failed:', error);
          setIsTeamsInitialized(false);
        }
      } else {
        setIsTeamsInitialized(true);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const handleTeamsSSO = async () => {
    try {
      const authTokenRequest = {
        successCallback: (token: string) => {
          handleToken(token);
        },
        failureCallback: (error: string) => {
          console.error('Teams SSO failed:', error);
          setIsLoading(false);
        },
        resources: [`api://app.teamscorecards.online/${authConfig.clientId}`]
      };
      await microsoftTeams.authentication.getAuthToken(authTokenRequest);
    } catch (error) {
      console.error('Teams SSO error:', error);
      setIsLoading(false);
    }
  };

  const handleStandardLogin = () => {
    const loginUrl = authConfig.getLoginUrl();
    window.location.href = loginUrl;
  };

  const handleToken = async (token: string) => {
    try {
      
      const response = await api.post('/auth/callback', { token });

      const userData = response.data.data;
      
      // Store the token first
      sessionStorage.setItem('auth_token', userData.token);
      
      // Then update the state
      setUser(userData.user);
      setIsAuthenticated(true);
      setHasLicenseError(false); // Reset license error state
      setLicenseStatus(null);     // Reset license status
      setIsLoading(false);
      
      // Only navigate if we're not already on the home page
      if (window.location.pathname !== '/') {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Token handling failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Handle consent required error
      if (
        error.response && 
        error.response.status === 403 && 
        error.response.data && 
        error.response.data.error === 'consent_required'
      ) {
        setIsLoading(false);
        navigate('/consent', { 
          state: { 
            consentUrl: error.response.data.consentUrl,
            tenantId: error.response.data.tenantId
          } 
        });
        return;
      }

      // Check for license errors
      if (
        error.response && 
        error.response.status === 403 && 
        error.response.data && 
        error.response.data.licenseError
      ) {
        setHasLicenseError(true);
        setLicenseStatus(error.response.data.licenseStatus || null);
        navigate('/license-error');
      }

      // Clear any potentially invalid token
      sessionStorage.removeItem('auth_token');
      setIsLoading(false);
      throw error;
    }
  };

  const login = async () => {
    setIsLoading(true);
    if (isTeams && isTeamsInitialized) {
      await handleTeamsSSO();
    } else {
      handleStandardLogin();
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    setHasLicenseError(false);
    setLicenseStatus(null);
    setIsLoading(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      isTeams, 
      isTeamsInitialized,
      hasLicenseError,
      licenseStatus,
      login, 
      logout,
      setIsAuthenticated,
      setUser,
      setIsLoading,
      setHasLicenseError,
      setLicenseStatus
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