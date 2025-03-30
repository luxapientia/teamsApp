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
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useAppSelector } from '../../../../../hooks/useAppSelector';
import { RootState } from '../../../../../store';
import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { updateAnnualTarget } from '../../../../../store/slices/scorecardSlice';
import { AnnualTargetPerspective } from '../../../../../types/annualCorporateScorecard';

interface PerspectiveTabProps {
  targetName: string;
}

const PerspectiveTab: React.FC<PerspectiveTabProps> = ({ targetName }) => {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [newPerspectiveName, setNewPerspectiveName] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const annualTarget = useAppSelector((state: RootState) => 
    state.scorecard.annualTargets.find(target => target.name === targetName)
  );
  const perspectives = annualTarget?.content.perspectives || [];

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleSave = () => {
    if (newPerspectiveName.trim() && annualTarget) {
      const newPerspective: AnnualTargetPerspective = {
        order: perspectives[perspectives.length - 1]?.order + 1 || 0,
        name: newPerspectiveName
      };

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          perspectives: [...perspectives, newPerspective],
        },
      }));
      setNewPerspectiveName('');
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewPerspectiveName('');
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = (perspective: AnnualTargetPerspective) => {
    if (annualTarget) {
      const updatedPerspectives = perspectives
        .filter((p) => p.order !== perspective.order)

      const updatedObjectives = annualTarget.content.objectives
        .filter((o) => o.perspective.order !== perspective.order)

      const updatedQuarterlyTargets = annualTarget.content.quarterlyTarget.quarterlyTargets.map((qt) => {
        return {
          ...qt,
          objectives: qt.objectives.filter((o) => o.perspective.order !== perspective.order)
        }
      })

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          perspectives: updatedPerspectives,
          objectives: updatedObjectives,
          quarterlyTarget: {
            ...annualTarget.content.quarterlyTarget,
            quarterlyTargets: updatedQuarterlyTargets
          }
        },
      }));
    }
  };

  const handleEdit = (perspective: AnnualTargetPerspective, index: number) => {
    setEditingIndex(index);
    setEditingValue(perspective.name);
  };

  const handleEditSave = () => {
    if (editingValue.trim() && annualTarget && editingIndex !== null) {
      const updatedPerspectives = [...perspectives];
      updatedPerspectives[editingIndex] = {
        ...updatedPerspectives[editingIndex],
        name: editingValue.trim()
      };

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          perspectives: updatedPerspectives,
        },
      }));
      setEditingValue('');
      setEditingIndex(null);
    }
  };

  const handleEditCancel = () => {
    setEditingValue('');
    setEditingIndex(null);
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
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
                '& .action-icons': {
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
              {editingIndex === index ? (
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={handleEditKeyPress}
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
              ) : (
                <Typography sx={{ color: '#374151' }}>
                  {perspective.name}
                </Typography>
              )}
              <Stack 
                direction="row" 
                spacing={1}
                className="action-icons"
                sx={{ opacity: 0 }}
              >
                {editingIndex === index ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={handleEditCancel}
                      sx={{ color: '#6B7280' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleEditSave}
                      sx={{ color: '#6B7280' }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(perspective, index)}
                      sx={{ color: '#6B7280' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(perspective)}
                      className="delete-icon"
                      sx={{
                        color: '#6B7280',
                        '&:hover': {
                          color: '#DC2626',
                          backgroundColor: '#FEE2E2',
                        },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
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
                value={newPerspectiveName}
                onChange={(e) => setNewPerspectiveName(e.target.value)}
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
