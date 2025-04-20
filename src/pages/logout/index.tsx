import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const LogoutPage: React.FC = () => {
  const { setUser } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear user data from auth context
        setUser(null);
        
        // Clear any stored tokens or session data
        localStorage.removeItem('token');
        sessionStorage.clear();
        
        // Redirect to Microsoft login page
        window.location.href = `${window.location.origin}/`;
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there's an error
        window.location.href = `${window.location.origin}/`;
      }
    };

    handleLogout();
  }, [setUser]);

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      <CircularProgress size={40} sx={{ color: '#0078D4', mb: 2 }} />
      <Typography variant="h6" color="textSecondary">
        Signing out...
      </Typography>
    </Box>
  );
};

export default LogoutPage; 