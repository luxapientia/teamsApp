import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { TrainingCardProps } from '../types';

export const TrainingCard: React.FC<TrainingCardProps> = ({ training, chipColor }) => (
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
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
        {training.name}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {training.description}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
      </Box>
    </CardContent>
  </Card>
); 