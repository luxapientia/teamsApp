import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      
      if (code) {
        try {
          console.log('Sending code to backend:', code);
          const redirectUri = `${window.location.origin}${location.pathname}`;
          const response = await axios.post(`${API_URL}/api/auth/callback`, {
            code,
            redirect_uri: redirectUri
          });

          console.log('Backend response:', response.data);

          if (response.data && response.data.token && response.data.user) {
            localStorage.setItem('auth_token', response.data.token);
            setUser(response.data.user);
            setIsAuthenticated(true);
            navigate('/', { replace: true });
          } else {
            console.error('Invalid response from server');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { replace: true });
        }
      } else {
        console.error('No code found in URL');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [location, navigate, setIsAuthenticated, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processing Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in...</p>
      </div>
    </div>
  );
}; 