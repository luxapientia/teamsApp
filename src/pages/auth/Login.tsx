import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isInTeams } from '../../utils/teamsUtils';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const isTeams = isInTeams();

  if (isAuthenticated) {
    console.log('User is already authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    console.log('Login button clicked');
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  console.log('Rendering login page, isTeams:', isTeams);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isTeams ? 'Teams Authentication' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isTeams 
              ? 'You are currently in Microsoft Teams. Click below to authenticate using your Teams account.'
              : 'Please sign in with your Microsoft account to access the application.'}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isTeams ? 'Sign in with Teams' : 'Sign in with Microsoft'}
          </button>
        </div>
      </div>
    </div>
  );
}; 