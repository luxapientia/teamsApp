import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
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

        console.log('Auth callback response received:', response.data ? 'success' : 'empty');

        if (response.data?.token) {
          // Store token directly in sessionStorage first
          sessionStorage.setItem('auth_token', response.data.token);
          console.log('Token stored in sessionStorage, length:', response.data.token.length);
          
          // Dispatch Redux actions with correct action types
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
          
          // Get stored redirect location
          const storedRedirect = sessionStorage.getItem('auth_redirect');
          let redirectTo = '/'; // Default route
          
          if (storedRedirect) {
            try {
              const redirectLocation = JSON.parse(storedRedirect);
              redirectTo = redirectLocation.pathname || '/';
              console.log('Found stored redirect path:', redirectTo);
            } catch (e) {
              console.error('Failed to parse stored redirect location:', e);
            }
          }
          
          sessionStorage.removeItem('auth_redirect');
          
          // Debugging
          console.log('Navigating to:', redirectTo);
          
          // Use window.location for hard navigation instead of React Router navigate
          window.location.href = redirectTo;
          
          // If you want to use React Router's navigate, you can try this instead:
          // setTimeout(() => {
          //   navigate(redirectTo, { replace: true });
          // }, 100);
        } else {
          console.error('No token received from server');
          throw new Error('No token received from server');
        }
      } catch (error) {
        console.error('Authentication callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
}; 