import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
  IconButton,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAppSelector } from '../../../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { RootState } from '../../../../../store';
import { updateAnnualTarget } from '../../../../../store/slices/scorecardSlice';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#374151',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#6B7280',
  fontWeight: 500,
}));

interface AssessmentsPeriodTabProps {
  targetName: string;
}

interface PeriodData {
  startDate: string;
  endDate: string;
}

interface ValidationErrors {
  startDate?: string;
  endDate?: string;
}

const AssessmentsPeriodTab: React.FC<AssessmentsPeriodTabProps> = ({ targetName }) => {
  const dispatch = useAppDispatch();
  const annualTarget = useAppSelector((state: RootState) => 
    state.scorecard.annualTargets.find(target => target.name === targetName)
  );

  const [editingQuarter, setEditingQuarter] = useState<string | null>(null);
  const [editData, setEditData] = useState<PeriodData>({ startDate: '', endDate: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  const handleEdit = (quarter: string) => {
    const period = annualTarget?.content.assessmentPeriod?.[quarter as keyof typeof annualTarget.content.assessmentPeriod];
    if (period) {
      setEditData({
        startDate: period.startDate,
        endDate: period.endDate
      });
    }
    setEditingQuarter(quarter);
    setErrors({});
  };

  const validateDates = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!editData.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }

    if (!editData.endDate.trim()) {
      newErrors.endDate = 'End date is required';
      isValid = false;
    }

    if (editData.startDate && editData.endDate && annualTarget) {
      const start = new Date(editData.startDate);
      const end = new Date(editData.endDate);
      const targetStart = new Date(annualTarget.startDate);
      const targetEnd = new Date(annualTarget.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      targetStart.setHours(0, 0, 0, 0);
      targetEnd.setHours(0, 0, 0, 0);

      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
        isValid = false;
      }

      // if (start < targetStart) {
      //   newErrors.startDate = 'Start date cannot be before annual target period';
      //   isValid = false;
      // }

      // if (start > targetEnd) {
      //   newErrors.startDate = 'Start date cannot be after annual target period';
      //   isValid = false;
      // }

      // if (end < targetStart) {
      //   newErrors.endDate = 'End date cannot be before annual target period';
      //   isValid = false;
      // }

      // if (end > targetEnd) {
      //   newErrors.endDate = 'End date cannot be after annual target period';
      //   isValid = false;
      // }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (annualTarget && editingQuarter && validateDates()) {
      const updatedPeriods = {
        ...annualTarget.content.assessmentPeriod,
        [editingQuarter]: editData
      };

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          assessmentPeriod: updatedPeriods
        },
      }));
      setEditingQuarter(null);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setEditingQuarter(null);
    setEditData({ startDate: '', endDate: '' });
    setErrors({});
  };

  return (
    <Box p={2}>
      <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledHeaderCell>Quarter</StyledHeaderCell>
              <StyledHeaderCell>Start Date</StyledHeaderCell>
              <StyledHeaderCell>End Date</StyledHeaderCell>
              <StyledHeaderCell align="center">Actions</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quarters.map((quarter) => {
              const period = annualTarget?.content.assessmentPeriod?.[quarter as keyof typeof annualTarget.content.assessmentPeriod];
              return (
                <TableRow key={quarter}>
                  <StyledTableCell>{quarter}</StyledTableCell>
                  <StyledTableCell>
                    {editingQuarter === quarter ? (
                      <TextField
                        type="date"
                        value={editData.startDate}
                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                        variant="standard"
                        size="small"
                        fullWidth
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                      />
                    ) : (
                      period?.startDate
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    {editingQuarter === quarter ? (
                      <TextField
                        type="date"
                        value={editData.endDate}
                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                        variant="standard"
                        size="small"
                        fullWidth
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                      />
                    ) : (
                      period?.endDate
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {editingQuarter === quarter ? (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleCancel}
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
                          size="small"
                          variant="contained"
                          onClick={handleSave}
                          sx={{
                            backgroundColor: '#0078D4',
                            '&:hover': {
                              backgroundColor: '#106EBE',
                            },
                          }}
                        >
                          Save
                        </Button>
                      </Stack>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(quarter)}
                        sx={{
                          color: '#6B7280',
                          padding: '4px',
                          '&:hover': {
                            color: '#0078D4',
                            backgroundColor: '#F0F9FF',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AssessmentsPeriodTab;
