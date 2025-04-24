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
  <Box>
    <Paper 
      sx={{ 
        p: 2,
        backgroundColor,
        borderRadius: 2,
        height: '100%'
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
      <Stack spacing={2} sx={{ px: 1 }}>
        {trainings.map(training => (
          <TrainingCard
            key={training.id}
            training={training}
            chipColor={chipColor}
          />
        ))}
        {trainings.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100px'
          }}>
            <Typography color="text.secondary">
              No trainings found
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  </Box>
); 