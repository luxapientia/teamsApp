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
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      const isTeams = isInTeams();
      console.log('Is running in Teams:', isTeams);

      if (isTeams) {
        try {
          await initializeTeams();
          console.log('Teams SDK initialized, attempting SSO...');
          await handleTeamsSSO();
        } catch (error) {
          console.error('Teams initialization failed:', error);
        }
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
        },
        resources: [`api://app.teamscorecards.online/${authConfig.clientId}`]
      };
      await microsoftTeams.authentication.getAuthToken(authTokenRequest);
    } catch (error) {
      console.error('Teams SSO error:', error);
      handleStandardLogin();
    }
  };

  const handleStandardLogin = () => {
    console.log('Starting standard Azure AD login...');
    const loginUrl = authConfig.getLoginUrl();
    window.location.href = loginUrl;
  };

  const handleToken = async (token: string) => {
    try {
      console.log('Handling token...');
      const response = await api.post('/auth/callback', { token });
      const userData = response.data;
      console.log('userData', userData);
      sessionStorage.setItem('auth_token', userData.token);
      setUser(userData.user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Token handling failed:', error);
      handleStandardLogin();
    }
  };

  const login = async () => {
    console.log('Login initiated...');
    if (isInTeams()) {
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
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
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