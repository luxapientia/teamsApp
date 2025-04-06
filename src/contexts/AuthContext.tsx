import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isInTeams, initializeTeams } from '../utils/teamsUtils';
import * as microsoftTeams from '@microsoft/teams-js';
import { authConfig } from '../config/authConfig';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  isTeams: boolean;
  isTeamsInitialized: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isTeams, setIsTeams] = useState(false);
  const [isTeamsInitialized, setIsTeamsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      setIsLoading(true);
      const teamsCheck = isInTeams();
      console.log('Is running in Teams:', teamsCheck);
      setIsTeams(teamsCheck);

      if (teamsCheck) {
        try {
          await initializeTeams();
          console.log('Teams SDK initialized');
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
      console.log('Starting Teams SSO process...');
      const authTokenRequest = {
        successCallback: (token: string) => {
          console.log('Teams SSO token received');
          handleToken(token);
        },
        failureCallback: (error: string) => {
          console.error('Teams SSO failed:', error);
          setIsLoading(false);
        },
        resources: [`api://app.teamscorecards.online/${authConfig.clientId}`]
      };
      console.log('authTokenRequest', authTokenRequest.resources);
      await microsoftTeams.authentication.getAuthToken(authTokenRequest);
    } catch (error) {
      console.error('Teams SSO error:', error);
      setIsLoading(false);
    }
  };

  const handleStandardLogin = () => {
    console.log('Starting standard Azure AD login...');
    const loginUrl = authConfig.getLoginUrl();
    window.location.href = loginUrl;
  };

  const handleToken = async (token: string) => {
    try {
      console.log('Handling token:', {
        tokenLength: token.length,
        tokenPreview: `${token.substring(0, 10)}...`,
        currentPath: window.location.pathname
      });
      
      const response = await api.post('/auth/callback', { token });
      console.log('Auth callback response:', {
        status: response.status,
        hasData: !!response.data,
        hasToken: response.data?.token?.length > 0,
        hasUser: !!response.data?.user
      });

      const userData = response.data;
      
      // Store the token first
      sessionStorage.setItem('auth_token', userData.token);
      console.log('Token stored in sessionStorage:', userData.token.substring(0, 10) + '...');
      
      // Then update the state
      setUser(userData.user);
      setIsAuthenticated(true);
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
      // Clear any potentially invalid token
      sessionStorage.removeItem('auth_token');
      setIsLoading(false);
      throw error;
    }
  };

  const login = async () => {
    console.log('Login initiated...');
    setIsLoading(true);
    if (isTeams && isTeamsInitialized) {
      console.log('Running in Teams, using Teams SSO...');
      await handleTeamsSSO();
    } else {
      console.log('Not in Teams, using standard login...');
      handleStandardLogin();
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
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
      login, 
      logout 
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