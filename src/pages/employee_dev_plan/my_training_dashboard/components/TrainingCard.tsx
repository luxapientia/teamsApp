import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import { TrainingCardProps } from '../types';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { RootState } from '../../../../store';

export const TrainingCard: React.FC<TrainingCardProps> = ({ training, chipColor }) => {
  const { annualTargets } = useAppSelector((state: RootState) => state.scorecard);

  const getAnnualTargetName = (targetId: string) => {
    const target = annualTargets.find(t => t._id === targetId);
    return target?.name || '-';
  };

  return (
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
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            icon={<FolderIcon />}
            label={getAnnualTargetName(training.annualTargetId)}
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              '& .MuiChip-icon': {
                color: '#1976d2'
              }
            }}
          />
          <Chip
            icon={<EventIcon />}
            label={training.quarter}
            size="small"
            sx={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              '& .MuiChip-icon': {
                color: '#2e7d32'
              }
            }}
          />
        </Box>
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
}; 