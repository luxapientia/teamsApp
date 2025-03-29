import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const { setIsAuthenticated, setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      if (!code) {
        console.error('No code received');
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await axios.post('http://localhost:3001/api/auth/callback', {
          code,
          redirect_uri: 'http://localhost:3000/auth/callback'
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          
          // Get user profile from the token
          try {
            const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
              headers: {
                Authorization: `Bearer ${response.data.token}`
              }
            });
            
            setUser(profileResponse.data);
            setIsAuthenticated(true);
            navigate('/main', { replace: true });
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            throw profileError;
          }
        } else {
          throw new Error('No token received');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [code, navigate, setIsAuthenticated, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Processing authentication...</p>
        </div>
      </div>
    </div>
  );
}; 