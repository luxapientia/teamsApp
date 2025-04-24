import React, { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    TextField,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { StyledTableCell } from '../../../../components/StyledTableComponents';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { RootState } from '../../../../store';
import { updateFeedback } from '../../../../store/slices/feedbackSlice';

interface FeedbackResponsesTabProps {
    feedbackId: string;
}

interface FeedbackResponse {
    score: number;
    response: string;
}

const FeedbackResponsesTab: React.FC<FeedbackResponsesTabProps> = ({ feedbackId }) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [score, setScore] = useState('');
    const [response, setResponse] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const feedback = useAppSelector((state: RootState) => 
        state.feedback.feedbacks.find((feedback) => feedback._id === feedbackId)
    );

    const handleOpen = () => {
        setOpen(true);
        setScore('');
        setResponse('');
        setEditMode(false);
        setEditIndex(null);
    };

    const handleClose = () => {
        setOpen(false);
        setScore('');
        setResponse('');
        setEditMode(false);
        setEditIndex(null);
    };

    const handleEdit = (index: number) => {
        const responseToEdit = feedback?.responses?.[index];
        if (!responseToEdit) return;

        setEditMode(true);
        setEditIndex(index);
        setScore(responseToEdit.score.toString());
        setResponse(responseToEdit.response);
        setOpen(true);
    };

    const handleDelete = (index: number) => {
        if (!feedback?.responses) return;

        const updatedResponses = [...feedback.responses];
        updatedResponses.splice(index, 1);
        const newFeedback = { ...feedback, responses: updatedResponses };
        dispatch(updateFeedback(newFeedback));
    };

    const handleSave = () => {
        if (!feedback || !score || !response) return;

        const newResponse: FeedbackResponse = {
            score: Number(score),
            response: response
        };

        let updatedResponses: FeedbackResponse[];
        
        if (editMode && editIndex !== null) {
            // Edit existing response
            updatedResponses = [...(feedback.responses || [])];
            updatedResponses[editIndex] = newResponse;
        } else {
            // Add new response
            updatedResponses = [...(feedback.responses || []), newResponse];
        }

        const newFeedback = { ...feedback, responses: updatedResponses };
        dispatch(updateFeedback(newFeedback));
        handleClose();
    };

    const validateScore = (value: string) => {
        const numberValue = Number(value);
        if (isNaN(numberValue)) return;
        
        // Check if the score is unique (except for the current edit item)
        const existingScores = feedback?.responses?.map((r, i) => 
            editMode && editIndex === i ? null : r.score
        ).filter(s => s !== null) || [];

        if (existingScores.includes(numberValue)) return;

        setScore(value);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{
                        backgroundColor: '#0078D4',
                        '&:hover': { backgroundColor: '#106EBE' },
                    }}
                >
                    New
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Score</StyledTableCell>
                            <StyledTableCell>Feedback Response</StyledTableCell>
                            <StyledTableCell align="right" sx={{ width: '100px' }}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {feedback?.responses?.map((response, index) => (
                            <TableRow key={index}>
                                <StyledTableCell>{response.score}</StyledTableCell>
                                <StyledTableCell>{response.response}</StyledTableCell>
                                <StyledTableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => handleEdit(index)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => handleDelete(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                        {(!feedback?.responses || feedback.responses.length === 0) && (
                            <TableRow>
                                <StyledTableCell colSpan={3} align="center">
                                    No feedback responses added
                                </StyledTableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>{editMode ? 'Edit Feedback Response' : 'Feedback Response'}</Box>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Score"
                            type="number"
                            value={score}
                            onChange={(e) => validateScore(e.target.value)}
                            sx={{ 
                                backgroundColor: '#f5f5f5',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#e0e0e0' }
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Feedback Response"
                            multiline
                            rows={3}
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
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
                                disabled={!score || !response}
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

export default FeedbackResponsesTab;
