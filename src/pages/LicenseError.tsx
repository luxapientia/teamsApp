import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface LicenseErrorProps {
  status?: string;
  message?: string;
}

const LicenseError: React.FC<LicenseErrorProps> = ({ 
  status = 'inactive',
  message = 'Your company license is not active.'
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'inactive':
        return 'Your company license is inactive. Please contact your administrator to activate it.';
      case 'expired':
        return 'Your company license has expired. Please contact your administrator to renew it.';
      case 'pending':
        return 'Your company license is pending activation. Please contact your administrator.';
      default:
        return message;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        py: 5
      }}>
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <ErrorOutlineIcon 
            color="error" 
            sx={{ fontSize: 80, mb: 2 }}
          />
          
          <Typography variant="h4" component="h1" gutterBottom>
            License Error
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            {getStatusMessage()}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleLogout}
              sx={{ mr: 2 }}
            >
              Go to Login
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            If you believe this is an error, please contact your system administrator
            or support team for assistance.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LicenseError; 