import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { StyledTableCell } from '../../../../components/StyledTableComponents';
import { FeedbackDimension, Feedback } from '../../../../types/feedback';
import { updateFeedback } from '../../../../store/slices/feedbackSlice';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { RootState } from '../../../../store';

interface FeedbackDimensionsTabProps {
    feedbackId: string;
}

const FeedbackDimensionsTab: React.FC<FeedbackDimensionsTabProps> = ({ feedbackId }) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [newDimension, setNewDimension] = useState<FeedbackDimension>({
        index: 0,
        name: '',
        weight: 0,
        questions: []
    });
    const [newIndex, setNewIndex] = useState(0);
    const [error, setError] = useState('');

    const feedback = useAppSelector((state: RootState) => state.feedback.feedbacks.find((feedback) => feedback._id === feedbackId));
    const [dimensions, setDimensions] = useState<FeedbackDimension[]>(feedback?.dimensions || []);

    useEffect(() => {
        setDimensions(feedback?.dimensions || []);
        setNewIndex(feedback?.dimensions[feedback?.dimensions.length - 1]?.index + 1 || 0);
    }, [feedback?.dimensions]);

    const handleOpen = () => {
        setOpen(true);
        setError('');
        setIsEditing(false);
        setEditIndex(null);
        setNewDimension({ index: newIndex, name: '', weight: 0, questions: [] });
    };

    const handleClose = () => {
        setOpen(false);
        setNewDimension({ index: newIndex, name: '', weight: 0, questions: [] });
        setError('');
        setIsEditing(false);
        setEditIndex(null);
    };

    const calculateTotalWeight = (excludeIndex?: number) => {
        return dimensions.reduce((sum, dimension, index) => {
            if (index === excludeIndex) return sum;
            return sum + dimension.weight;
        }, 0);
    };

    const validateWeight = (weight: number, currentIndex?: number) => {
        const totalWeight = calculateTotalWeight(currentIndex);
        return totalWeight + weight <= 100;
    };

    const handleSave = () => {
        if (!newDimension.name) {
            setError('Please enter a feedback dimension name');
            return;
        }
        if (!newDimension.weight) {
            setError('Please enter a weight percentage');
            return;
        }

        if (!validateWeight(newDimension.weight, editIndex !== null ? editIndex : undefined)) {
            setError('Total weight cannot exceed 100%');
            return;
        }

        let newDimensions;
        if (isEditing && editIndex !== null) {
            newDimensions = dimensions.map((dim, index) => 
                index === editIndex ? newDimension : dim
            );
        } else {
            newDimensions = [...dimensions, newDimension];
        }

        const newFeedback = { ...feedback, dimensions: newDimensions };
        dispatch(updateFeedback(newFeedback));
        handleClose();
    };

    const handleEdit = (index: number) => {
        setIsEditing(true);
        setEditIndex(index);
        setNewDimension({ ...dimensions[index] });
        setOpen(true);
        setError('');
    };

    const handleDelete = (index: number) => {
        const newDimensions = dimensions.filter((_, i) => i !== index);
        const newFeedback = { ...feedback, dimensions: newDimensions };
        dispatch(updateFeedback(newFeedback));
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 2 }}>
                        Total Weight % = {calculateTotalWeight()}
                    </Typography>
                </Box>
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

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Feedback Dimension</StyledTableCell>
                            <StyledTableCell>Weight %</StyledTableCell>
                            <StyledTableCell align="right" sx={{ width: '100px' }}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dimensions.map((dimension, index) => (
                            <TableRow key={index}>
                                <StyledTableCell>{dimension.name}</StyledTableCell>
                                <StyledTableCell>{dimension.weight}</StyledTableCell>
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
                        {dimensions.length === 0 && (
                            <TableRow>
                                <StyledTableCell colSpan={3} align="center">
                                    No feedback dimensions added
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
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            {isEditing ? 'Edit Feedback Dimension' : 'Add Feedback Dimension'}
                        </Typography>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Feedback Dimension</Typography>
                        <TextField
                            fullWidth
                            value={newDimension.name}
                            onChange={(e) => setNewDimension({ ...newDimension, name: e.target.value })}
                            sx={{ mb: 3 }}
                            error={!!error && !newDimension.name}
                        />
                        
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Weight %</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            value={newDimension.weight || ''}
                            onChange={(e) => setNewDimension({ ...newDimension, weight: Number(e.target.value) })}
                            error={!!error && !newDimension.weight}
                        />
                        {error && (
                            <Typography color="error" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            backgroundColor: '#0078D4',
                            '&:hover': { backgroundColor: '#106EBE' },
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeedbackDimensionsTab;
