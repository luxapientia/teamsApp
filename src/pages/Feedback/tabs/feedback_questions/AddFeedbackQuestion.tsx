import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    TextField,
    FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FeedbackDimension } from '../../../../types/feedback';

interface AddFeedbackQuestionProps {
    open: boolean;
    onClose: () => void;
    dimensions: FeedbackDimension[];
    onSave: (dimensionIndex: number, questions: string[]) => void;
    editMode?: boolean;
    initialDimension?: FeedbackDimension;
    initialQuestion?: string;
    onEdit?: (dimensionIndex: number, questionIndex: number, newQuestion: string) => void;
    questionIndex?: number;
}

const AddFeedbackQuestion: React.FC<AddFeedbackQuestionProps> = ({
    open,
    onClose,
    dimensions,
    onSave,
    editMode = false,
    initialDimension,
    initialQuestion = '',
    onEdit,
    questionIndex
}) => {
    const [selectedDimension, setSelectedDimension] = useState<FeedbackDimension | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [errors, setErrors] = useState({
        dimension: false,
        question: false
    });

    useEffect(() => {
        if (editMode && initialDimension && initialQuestion) {
            setSelectedDimension(initialDimension);
            setNewQuestion(initialQuestion);
        }
    }, [editMode, initialDimension, initialQuestion]);

    const handleClose = () => {
        setSelectedDimension(null);
        setQuestions([]);
        setNewQuestion('');
        setErrors({ dimension: false, question: false });
        onClose();
    };

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            setQuestions([...questions, newQuestion.trim()]);
            setNewQuestion('');
        }
    };

    const handleSave = () => {
        const hasValidDimension = !!selectedDimension;
        const hasValidQuestion = editMode ? !!newQuestion.trim() : (questions.length > 0 || !!newQuestion.trim());

        setErrors({
            dimension: !hasValidDimension,
            question: !hasValidQuestion
        });

        if (!hasValidDimension || !hasValidQuestion) {
            return;
        }

        if (editMode && selectedDimension && onEdit && questionIndex !== undefined) {
            onEdit(selectedDimension.index, questionIndex, newQuestion.trim());
        } else if (selectedDimension && (questions.length > 0 || newQuestion.trim())) {
            const allQuestions = newQuestion.trim() 
                ? [...questions, newQuestion.trim()]
                : questions;
            onSave(selectedDimension.index, allQuestions);
        }
        handleClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>Feedback Dimension</Box>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth error={errors.dimension}>
                        <Select
                            value={selectedDimension?.name || ''}
                            onChange={(e) => {
                                const dimension = dimensions.find(d => d.name === e.target.value);
                                setSelectedDimension(dimension || null);
                                setErrors(prev => ({ ...prev, dimension: false }));
                            }}
                            displayEmpty
                            disabled={editMode}
                            sx={{ 
                                backgroundColor: '#f5f5f5',
                                '& .MuiSelect-select': { py: 1.5 }
                            }}
                        >
                            <MenuItem value="" disabled>Select Feedback Dimension</MenuItem>
                            {dimensions.map((dimension) => (
                                <MenuItem key={dimension.index} value={dimension.name}>
                                    {dimension.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.dimension && (
                            <FormHelperText>Please select a feedback dimension</FormHelperText>
                        )}
                    </FormControl>

                    {!editMode && (
                        <Button
                            variant="contained"
                            onClick={handleAddQuestion}
                            sx={{
                                backgroundColor: '#6B5ECD',
                                '&:hover': { backgroundColor: '#5a4fb8' },
                                alignSelf: 'flex-start',
                                textTransform: 'none',
                                px: 3
                            }}
                        >
                            Add Feedback Question
                        </Button>
                    )}

                    {!editMode && questions.length > 0 && (
                        <Box sx={{ width: '100%', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            {questions.map((question, index) => (
                                <Box key={index} sx={{ mb: 1 }}>
                                    {question}
                                </Box>
                            ))}
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={newQuestion}
                        onChange={(e) => {
                            setNewQuestion(e.target.value);
                            setErrors(prev => ({ ...prev, question: false }));
                        }}
                        error={errors.question}
                        helperText={errors.question ? "Please enter a feedback question" : ""}
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
    );
};

export default AddFeedbackQuestion;
