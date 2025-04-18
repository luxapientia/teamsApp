import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Training {
  id: string;
  name: string;
  date: string;
}

const MyTrainingDashboard: React.FC = () => {
  // Mock data - replace with actual API calls
  const requestedTrainings: Training[] = [
    { id: '1', name: 'Cybersecurity 101', date: '17 Mar' },
    { id: '2', name: 'Set up Microsoft Teams', date: '17 Mar' },
  ];

  const plannedTrainings: Training[] = [
    { id: '3', name: 'Emotional Intelligence', date: '17 Mar' },
  ];

  const completedTrainings: Training[] = [
    { id: '4', name: 'Microsoft Excel', date: '17 Mar' },
  ];

  const renderTrainingCard = (training: Training, chipColor: string, bgColor: string) => (
    <Card 
      key={training.id}
      sx={{ 
        mb: 2,
        backgroundColor: 'white',
        '&:last-child': {
          mb: 0
        }
      }}
    >
      <CardContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {training.name}
        </Typography>
        <Chip
          icon={<AccessTimeIcon />}
          label={training.date}
          size="small"
          sx={{
            backgroundColor: chipColor,
            color: chipColor === '#e0e0e0' ? 'text.secondary' : 'white',
            '& .MuiChip-icon': {
              color: chipColor === '#e0e0e0' ? 'text.secondary' : 'white'
            }
          }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        My Training Dashboard
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2
      }}>
        {/* Requested Trainings */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: '#f5f5f5', // grey background
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Requested
            </Typography>
            <Stack spacing={2}>
              {requestedTrainings.map(training => 
                renderTrainingCard(training, '#e0e0e0', '#f5f5f5')
              )}
            </Stack>
          </Paper>
        </Box>

        {/* Planned Trainings */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: '#fff3e0', // amber background
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Planned
            </Typography>
            <Stack spacing={2}>
              {plannedTrainings.map(training => 
                renderTrainingCard(training, '#2e7d32', '#fff3e0')
              )}
            </Stack>
          </Paper>
        </Box>

        {/* Completed Trainings */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '100%',
              backgroundColor: '#e8f5e9', // green background
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Completed
            </Typography>
            <Stack spacing={2}>
              {completedTrainings.map(training => 
                renderTrainingCard(training, '#2e7d32', '#e8f5e9')
              )}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MyTrainingDashboard;
