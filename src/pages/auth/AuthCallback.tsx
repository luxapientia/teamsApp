import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setIsAuthenticated, setUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple processing attempts
      if (isProcessing) {
        console.log('Already processing callback');
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);
        
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (!code) {
          throw new Error('No authorization code found');
        }

        console.log('Processing auth callback with code');
        
        const response = await axios.post(`${API_URL}/api/auth/callback`, {
          code,
          redirect_uri: `${window.location.origin}/auth/callback`
        });

        console.log('Auth callback response:', {
          status: response.status,
          hasData: !!response.data,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });

        if (!response.data?.token) {
          throw new Error('No token received from server');
        }

        // Store token in sessionStorage
        sessionStorage.setItem('auth_token', response.data.token);
        console.log('Token stored in sessionStorage');
        
        // Update auth context
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Dispatch Redux actions
        dispatch({ 
          type: 'auth/setToken', 
          payload: response.data.token 
        });
        
        if (response.data.user) {
          console.log('User data received:', response.data.user.email);
          dispatch({ 
            type: 'auth/setAuth', 
            payload: {
              isAuthenticated: true,
              user: response.data.user
            }
          });
        }

        // Get stored redirect location or default to home
        const storedRedirect = sessionStorage.getItem('auth_redirect');
        let redirectTo = '/';
        
        if (storedRedirect) {
          try {
            const redirectLocation = JSON.parse(storedRedirect);
            redirectTo = redirectLocation.pathname || '/';
            console.log('Found stored redirect path:', redirectTo);
          } catch (e) {
            console.error('Failed to parse stored redirect location:', e);
          }
          sessionStorage.removeItem('auth_redirect');
        }
        
        console.log('Navigating to:', redirectTo);
        navigate(redirectTo, { replace: true });
      } catch (error: any) {
        console.error('Authentication callback error:', {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        });
        setError(error.response?.data?.error || error.message || 'Authentication failed');
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [location, navigate, dispatch, isProcessing, setIsAuthenticated, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        {error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <p className="text-gray-600">Please wait while we complete your sign-in.</p>
        )}
      </div>
    </div>
  );
}; 