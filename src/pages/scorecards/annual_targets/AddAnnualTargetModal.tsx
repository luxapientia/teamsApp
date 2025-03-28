import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AnnualTarget, AnnualTargetStatus } from '../../../types/annualCorporateScorecard';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { createAnnualTarget, updateAnnualTarget } from '../../../store/slices/scorecardSlice';


interface AddAnnualTargetModalProps {
  open: boolean;
  onClose: () => void;
  // onSubmit: (target: Omit<AnnualTarget, 'id'>) => void;
  editingAnnualTarget: AnnualTarget | null;
}

const AddAnnualTargetModal: React.FC<AddAnnualTargetModalProps> = ({
  open,
  onClose,
  editingAnnualTarget,
}) => {
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<string>(formatDateForInput(new Date()));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(new Date()));
  const [status, setStatus] = useState<AnnualTargetStatus>(AnnualTargetStatus.Active);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (editingAnnualTarget) {
      // Pre-fill form with editing target data
      setName(editingAnnualTarget.name);
      setStartDate(editingAnnualTarget.startDate);
      setEndDate(editingAnnualTarget.endDate);
      setStatus(editingAnnualTarget.status);
    }
  }, [editingAnnualTarget]);

  // Helper function to format date to YYYY-MM-DD

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    setStartDate(newStartDate.toISOString().split('T')[0]);

    // If end date is before new start date, update end date
    if (endDate < newStartDate.toISOString().split('T')[0]) {
      setEndDate(newStartDate.toISOString().split('T')[0]);
      setDateError('');
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    if (newEndDate.toISOString().split('T')[0] < startDate) {
      setDateError('End date cannot be before start date');
      return;
    }
    setEndDate(newEndDate.toISOString().split('T')[0]);
    setDateError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (endDate < startDate) {
      setDateError('End date cannot be before start date');
      return;
    }

    if (editingAnnualTarget) {
      dispatch(updateAnnualTarget({
        ...editingAnnualTarget,
        name,
        startDate,
        endDate,
        status,
      }));
    } else {
      dispatch(createAnnualTarget({
        name,
        startDate,
        endDate,
        status,
        content: {
          perspectives: [],
          objectives: [],
          ratingScores: [],
          assesmentPeriod: {
            Q1: {
              startDate: '',
              endDate: '',
            },
            Q2: {
              startDate: '',
              endDate: '',
            },
            Q3: {
              startDate: '',
              endDate: '',
            },
            Q4: {
              startDate: '',
              endDate: '',
            },
          },
          contractingPeriod: {
            Q1: {
              startDate: '',
              endDate: '',
            },
            Q2: {
              startDate: '',
              endDate: '',
            },
            Q3: {
              startDate: '',
              endDate: '',
            },
            Q4: {
              startDate: '',
              endDate: '',
            },
          },
        },
      }));
    }

    onClose();
  };

  const handleClose = () => {
    setName('');
    setStartDate(formatDateForInput(new Date()));
    setEndDate(formatDateForInput(new Date()));
    setStatus(AnnualTargetStatus.Active);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Create Annual Corporate Scorecard
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Name Field */}
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                placeholder="Type a name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F9FAFB',
                  }
                }}
              />

              {/* Date Fields */}
              <Stack spacing={1}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Start date"
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F9FAFB',
                      }
                    }}
                  />
                  <TextField
                    label="End date"
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    fullWidth
                    required
                    error={!!dateError}
                    helperText={dateError}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F9FAFB',
                      }
                    }}
                  />
                </Stack>
                {dateError && (
                  <Typography color="error" variant="caption" sx={{ pl: 1 }}>
                    {dateError}
                  </Typography>
                )}
              </Stack>

              {/* Status Dropdown */}
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value as AnnualTargetStatus)}
                  sx={{
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <MenuItem value={AnnualTargetStatus.Active}>Active</MenuItem>
                  <MenuItem value={AnnualTargetStatus.Inactive}>Inactive</MenuItem>
                </Select>
              </FormControl>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    backgroundColor: '#0078D4',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#106EBE',
                    },
                  }}
                >
                  Save
                </Button>
              </Box>
            </Stack>
          </form>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnnualTargetModal; 