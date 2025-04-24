import React, { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { StyledTableCell } from '../../../../components/StyledTableComponents';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { RootState } from '../../../../store';
import { updateFeedback } from '../../../../store/slices/feedbackSlice';

interface ContributionScoreTabProps {
    feedbackId: string;
}

const ContributionScoreTab: React.FC<ContributionScoreTabProps> = ({ feedbackId }) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [contributionScore, setContributionScore] = useState('');
    const [error, setError] = useState('');
    
    const feedback = useAppSelector((state: RootState) => 
        state.feedback.feedbacks.find((feedback) => feedback._id === feedbackId)
    );

    const handleEdit = () => {
        if (!feedback?.contributionScorePercentage) {
            setContributionScore('');
        } else {
            setContributionScore(feedback.contributionScorePercentage.toString());
        }
        setError('');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setContributionScore('');
        setError('');
    };

    const validateScore = (value: string) => {
        const numberValue = Number(value);
        if (isNaN(numberValue)) {
            setError('Please enter a valid number');
            return false;
        }
        if (numberValue < 0 || numberValue > 100) {
            setError('Percentage must be between 0 and 100');
            return false;
        }
        return true;
    };

    const handleSave = () => {
        dispatch(updateFeedback({...feedback, contributionScorePercentage: Number(contributionScore)}));
        handleClose();
    };

    const handleScoreChange = (value: string) => {
        setContributionScore(value);
        if (value) {
            validateScore(value);
        } else {
            setError('');
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>% Contribution to overall performance score</StyledTableCell>
                            <StyledTableCell align="center">%</StyledTableCell>
                            <StyledTableCell align="right" sx={{ width: '100px' }}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <StyledTableCell>% Contribution to overall performance score</StyledTableCell>
                            <StyledTableCell align="center">
                                {feedback?.contributionScorePercentage || ''}%
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <Tooltip title="Edit">
                                    <IconButton 
                                        size="small" 
                                        onClick={handleEdit}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </StyledTableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>Edit Contribution Score</Box>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Contribution Score (%)"
                            type="number"
                            value={contributionScore}
                            onChange={(e) => handleScoreChange(e.target.value)}
                            error={!!error}
                            helperText={error}
                            InputProps={{
                                inputProps: { 
                                    min: 0,
                                    max: 100
                                }
                            }}
                            sx={{ 
                                backgroundColor: '#f5f5f5',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#e0e0e0' }
                                }
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={!contributionScore || !!error}
                                sx={{
                                    backgroundColor: '#e0e0e0',
                                    color: '#000',
                                    '&:hover': { backgroundColor: '#d5d5d5' },
                                    textTransform: 'none'
                                }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ContributionScoreTab;
