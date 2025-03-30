import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const { setIsAuthenticated, setUser, token } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      if (!code) {
        console.error('No code received');
        navigate('/login', { replace: true });
        return;
      }

      try {
        console.log('Sending callback request with code:', code);
        const response = await api.post('/auth/callback', { code });
        console.log('Callback response:', response.data);

        const authToken = response.data?.data?.token || response.data?.token;
        
        if (authToken) {
          localStorage.setItem('token', authToken);
          
          // Get user profile from the token
          try {
            const profileResponse = await api.get('/auth/profile', {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            });
            
            const userProfile = profileResponse.data?.data || profileResponse.data;
            setUser(userProfile);
            setIsAuthenticated(true);
            navigate('/main', { replace: true });
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
          }
        } else {
          console.error('No token in response:', response.data);
          throw new Error('No token received');
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        console.error('Error details:', error.response?.data);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    };

    if (!token) {
      handleCallback();
    } else {
      navigate('/main', { replace: true });
    }
  }, [code, navigate, setIsAuthenticated, setUser, token]);

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