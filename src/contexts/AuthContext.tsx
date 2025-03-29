import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import axios from 'axios';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await axios.get('http://localhost:3001/api/auth/profile', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setUser(response.data);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Profile fetch error:', error);
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    try {
      await authService.login();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        loading,
        setIsAuthenticated,
        setUser
      }}
    >
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