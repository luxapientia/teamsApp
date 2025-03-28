import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAppSelector } from '../../../../../hooks/useAppSelector';
import { RootState } from '../../../../../store';
import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { updateAnnualTarget } from '../../../../../store/slices/scorecardSlice';
 

interface PerspectiveTabProps {
  targetName: string;
}

const PerspectiveTab: React.FC<PerspectiveTabProps> = ({ targetName }) => {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [newPerspective, setNewPerspective] = useState('');

  const annualTarget = useAppSelector((state: RootState) => 
    state.scorecard.annualTargets.find(target => target.name === targetName)
  );
  const perspectives = annualTarget?.content.perspectives || [];

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleSave = () => {
    if (newPerspective.trim() && annualTarget) {
      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          perspectives: [...perspectives, newPerspective.trim()],
        },
      }));
      setNewPerspective('');
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewPerspective('');
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = (index: number) => {
    if (annualTarget) {
      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          perspectives: perspectives.filter((_, i) => i !== index),
        },
      }));
    }
  };

  return (
    <Box p={2}>
      <Stack spacing={2}>
        {perspectives.map((perspective, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB',
                '& .delete-icon': {
                  opacity: 1,
                },
              },
            }}
          >
            <Stack 
              direction="row" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{ p: 2 }}
            >
              <Typography sx={{ color: '#374151' }}>
                {perspective}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleDelete(index)}
                className="delete-icon"
                sx={{
                  opacity: 0,
                  transition: 'all 0.2s ease',
                  color: '#6B7280',
                  '&:hover': {
                    color: '#DC2626',
                    backgroundColor: '#FEE2E2',
                  },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}

        {isAdding ? (
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              p: 2,
            }}
          >
            <Stack spacing={2}>
              <TextField
                autoFocus
                fullWidth
                size="small"
                value={newPerspective}
                onChange={(e) => setNewPerspective(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter perspective name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F9FAFB',
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover fieldset': {
                      borderColor: '#D1D5DB',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6264A7',
                    },
                  },
                }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button 
                  onClick={handleCancel}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#6264A7',
                    '&:hover': {
                      backgroundColor: '#4F46E5',
                    },
                  }}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Button
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              color: '#6B7280',
              justifyContent: 'flex-start',
              textTransform: 'none',
              p: 2,
              border: '1px dashed #E5E7EB',
              borderRadius: '8px',
              width: '100%',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#6264A7',
                color: '#6264A7',
              },
            }}
          >
            Add new
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default PerspectiveTab;
