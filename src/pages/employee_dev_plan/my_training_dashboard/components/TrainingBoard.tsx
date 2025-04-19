import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { TrainingBoardProps } from '../types';
import { TrainingCard } from './TrainingCard';

export const TrainingBoard: React.FC<TrainingBoardProps> = ({
  title,
  trainings,
  backgroundColor,
  chipColor,
}) => (
  <Box sx={{ 
    flex: 1, 
    width: '100%',
    minWidth: { xs: '100%', sm: '300px' },
    maxWidth: { xs: '100%', lg: '400px' }
  }}>
    <Paper 
      sx={{ 
        p: 2,
        height: { xs: 'auto', md: '600px' },
        backgroundColor,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 2, 
          fontWeight: 'medium',
          px: 1
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0,0,0,0.2)',
          }
        }}
      >
        <Stack spacing={2} sx={{ px: 1 }}>
          {trainings.map(training => (
            <TrainingCard
              key={training.id}
              training={training}
              chipColor={chipColor}
            />
          ))}
        </Stack>
      </Box>
    </Paper>
  </Box>
); 