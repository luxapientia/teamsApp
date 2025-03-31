import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
  TextField,
  Stack,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppSelector } from '../../../../../hooks/useAppSelector';
import { RootState } from '../../../../../store';
import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { updateAnnualTarget } from '../../../../../store/slices/scorecardSlice';
import { AnnualTargetRatingScale } from '../../../../../types/annualCorporateScorecard';

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

const StyledActionsCell = styled(StyledTableCell)({
  width: '120px',
  textAlign: 'right',
});

interface RatingScaleTabProps {
  targetName: string;
}

interface ValidationErrors {
  name?: string;
  min?: string;
  max?: string;
}

const RatingScaleTab: React.FC<RatingScaleTabProps> = ({ targetName }) => {
  const dispatch = useAppDispatch();
  const annualTarget = useAppSelector((state: RootState) => 
    state.scorecard.annualTargets.find(target => target.name === targetName)
  );

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const getNextScore = (): number => {
    if (editingIndex !== null && annualTarget?.content.ratingScales) {
      return annualTarget.content.ratingScales[editingIndex].score;
    }
    return (annualTarget?.content.ratingScales?.length || 0) + 1;

  };

  const [newRating, setNewRating] = useState<AnnualTargetRatingScale>({
    score: getNextScore(),
    name: '',
    min: '0',
    max: '0',
    color: '#000000',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate name
    if (!newRating.name.trim()) {
      newErrors.name = 'Performance Review Rating is required';
      isValid = false;
    }

    // // Validate min percentage
    // if (Number(newRating.min) < 0) {
    //   newErrors.min = 'Min % must be greater than or equal to 0';
    //   isValid = false;
    // }

    // // Validate max percentage
    // if (Number(newRating.max) <= Number(newRating.min)) {
    //   newErrors.max = 'Max % must be greater than Min %';
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleEdit = (index: number) => {
    const ratingToEdit = annualTarget?.content.ratingScales[index];
    if (ratingToEdit) {
      // setNewRating(ratingToEdit);
      setEditingIndex(index);
    }
  };

  const handleDelete = (index: number) => {
    if (annualTarget) {
      const updatedRatings = annualTarget.content.ratingScales.filter((_, i) => i !== index)
        .map((rating, i) => ({ ...rating, score: i + 1 })); // Reorder scores after deletion

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          ratingScales: updatedRatings,
        },
      }));
    }
  };

  const handleAdd = () => {
    if (annualTarget && validateForm()) {
      const updatedRatings = [...(annualTarget.content.ratingScales || [])];
      
      if (editingIndex !== null) {
        updatedRatings[editingIndex] = newRating;
      } else {
        updatedRatings.push(newRating);
      }

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          ratingScales: updatedRatings,
        },
      }));

      // setNewRating({
      //   score: getNextScore(),
      //   name: '',
      //   min: '0',
      //   max: '0',
      //   color: '#000000',
      // });
      setIsAdding(false);
      setEditingIndex(null);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    // setNewRating({
    //   score: getNextScore(),
    //   name: '',
    //   min: '0',
    //   max: '0',
    //   color: '#000000',
    // });
    setErrors({});
  };

  return (
    <Box p={2}>
      <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledHeaderCell>Score</StyledHeaderCell>
              <StyledHeaderCell>Performance Review Rating</StyledHeaderCell>
              <StyledHeaderCell>Min %</StyledHeaderCell>
              <StyledHeaderCell>Max %</StyledHeaderCell>
              <StyledHeaderCell>Colour</StyledHeaderCell>
              <StyledHeaderCell align="center">Actions</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {annualTarget?.content.ratingScales?.map((rating, index) => (
              <TableRow key={index}>
                <StyledTableCell>{rating.score}</StyledTableCell>
                <StyledTableCell>
                  {editingIndex === index ? (
                    <TextField
                      value={newRating.name}
                      onChange={(e) => setNewRating({ ...newRating, name: e.target.value })}
                      variant="standard"
                      size="small"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  ) : (
                    rating.name
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editingIndex === index ? (
                    <TextField
                      value={newRating.min}
                      onChange={(e) => setNewRating({ ...newRating, min: e.target.value })}
                      variant="standard"
                      size="small"
                      fullWidth
                      error={!!errors.min}
                      helperText={errors.min}
                    />
                  ) : (
                    rating.min
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editingIndex === index ? (
                    <TextField
                      value={newRating.max}
                      onChange={(e) => setNewRating({ ...newRating, max: e.target.value })}
                      variant="standard"
                      size="small"
                      fullWidth
                      error={!!errors.max}
                      helperText={errors.max}
                    />
                  ) : (
                    rating.max
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editingIndex === index ? (
                    <TextField
                      type="color"
                      value={newRating.color}
                      onChange={(e) => setNewRating({ ...newRating, color: e.target.value })}
                      variant="standard"
                      size="small"
                      sx={{ width: 70 }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        backgroundColor: rating.color,
                      }}
                    />
                  )}
                </StyledTableCell>
                <StyledActionsCell>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {editingIndex === index ? (
                      <>
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
                          onClick={handleAdd}
                          sx={{
                            backgroundColor: '#0078D4',
                            '&:hover': {
                              backgroundColor: '#106EBE',
                            },
                          }}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(index)}
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
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(index)}
                          sx={{
                            color: '#6B7280',
                            padding: '4px',
                            '&:hover': {
                              color: '#DC2626',
                              backgroundColor: '#FEF2F2',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </StyledActionsCell>
              </TableRow>
            ))}
            {isAdding && editingIndex === null && (
              <TableRow>
                <StyledTableCell>{newRating.score}</StyledTableCell>
                <StyledTableCell>
                  <TextField
                    value={newRating.name}
                    onChange={(e) => setNewRating({ ...newRating, name: e.target.value })}
                    variant="standard"
                    size="small"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <TextField
                    value={newRating.min}
                    onChange={(e) => setNewRating({ ...newRating, min: e.target.value })}
                    variant="standard"
                    size="small"
                    fullWidth
                    error={!!errors.min}
                    helperText={errors.min}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <TextField
                    value={newRating.max}
                    onChange={(e) => setNewRating({ ...newRating, max: e.target.value })}
                    variant="standard"
                    size="small"
                    fullWidth
                    error={!!errors.max}
                    helperText={errors.max}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <TextField
                    type="color"
                    value={newRating.color}
                    onChange={(e) => setNewRating({ ...newRating, color: e.target.value })}
                    variant="standard"
                    size="small"
                    sx={{ width: 70 }}
                  />
                </StyledTableCell>
                <StyledTableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
        {isAdding && editingIndex === null && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, gap: 1 }}>
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
              onClick={handleAdd}
              sx={{
                backgroundColor: '#0078D4',
                '&:hover': {
                  backgroundColor: '#106EBE',
                },
              }}
            >
              Save
            </Button>
          </Box>
        )}
      </Paper>

      {!isAdding && editingIndex === null && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setIsAdding(true)
            setNewRating({
              score: getNextScore(),
              name: '',
              min: '0',
              max: '0',
              color: '#000000',
            })
          }}
          sx={{
            mt: 2,
            color: '#6B7280',
            justifyContent: 'flex-start',
            textTransform: 'none',
            p: 2,
            border: '1px dashed #E5E7EB',
            borderRadius: '8px',
            width: '100%',
            '&:hover': {
              backgroundColor: '#F9FAFB',
              borderColor: '#0078D4',
              color: '#0078D4',
            },
          }}
        >
          New
        </Button>
      )}
    </Box>
  );
};

export default RatingScaleTab;
