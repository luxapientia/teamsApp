import React from 'react';
import {
  Box,
  Typography,
  Container,
} from '@mui/material';
import { TrainingBoard } from './components/TrainingBoard';
import { Training } from './types';

const MyTrainingDashboard: React.FC = () => {
  // Mock data - replace with actual API calls
  const requestedTrainings: Training[] = [
    { 
      id: '1', 
      name: 'Cybersecurity 101', 
      description: 'Learn the fundamentals of cybersecurity and best practices for protecting digital assets.',
      date: '17 Mar' 
    },
    { 
      id: '2', 
      name: 'Set up Microsoft Teams', 
      description: 'A comprehensive guide to setting up and effectively using Microsoft Teams for collaboration.',
      date: '17 Mar' 
    },
  ];

  const plannedTrainings: Training[] = [
    { 
      id: '3', 
      name: 'Emotional Intelligence', 
      description: 'Develop your emotional intelligence skills to improve workplace relationships and leadership.',
      date: '17 Mar' 
    },
  ];

  const completedTrainings: Training[] = [
    { 
      id: '4', 
      name: 'Microsoft Excel', 
      description: 'Master advanced Excel features including pivot tables, macros, and data analysis tools.',
      date: '17 Mar' 
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        p: { xs: 2, md: 3 },
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            px: { xs: 1, md: 2 }
          }}
        >
          My Training Dashboard
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          flex: 1,
          overflow: 'hidden'
        }}>
          <TrainingBoard
            title="Requested"
            trainings={requestedTrainings}
            backgroundColor="#f5f5f5"
            chipColor="#e0e0e0"
          />
          <TrainingBoard
            title="Planned"
            trainings={plannedTrainings}
            backgroundColor="#fff3e0"
            chipColor="#2e7d32"
          />
          <TrainingBoard
            title="Completed"
            trainings={completedTrainings}
            backgroundColor="#e8f5e9"
            chipColor="#2e7d32"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default MyTrainingDashboard;
