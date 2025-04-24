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
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { StyledTableCell } from '../../../../components/StyledTableComponents';
import { FeedbackDimension, Feedback } from '../../../../types/feedback';
import { updateFeedback } from '../../../../store/slices/feedbackSlice';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { RootState } from '../../../../store';
import AddFeedbackQuestion from './AddFeedbackQuestion';

interface FeedbackQuestionsTabProps {
    feedbackId: string;
}

const FeedbackQuestionsTab: React.FC<FeedbackQuestionsTabProps> = ({ feedbackId }) => {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editDimension, setEditDimension] = useState<FeedbackDimension | null>(null);
    const [editQuestion, setEditQuestion] = useState<string>('');
    const [editQuestionIndex, setEditQuestionIndex] = useState<number | null>(null);

    const feedback = useAppSelector((state: RootState) => 
        state.feedback.feedbacks.find((feedback) => feedback._id === feedbackId)
    );

    const handleOpen = () => {
        setOpen(true);
        setEditMode(false);
        setEditDimension(null);
        setEditQuestion('');
        setEditQuestionIndex(null);
    };

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setEditDimension(null);
        setEditQuestion('');
        setEditQuestionIndex(null);
    };

    const handleSaveQuestions = (dimensionIndex: number, questions: string[]) => {
        if (!feedback) return;

        const updatedDimensions = feedback.dimensions.map(dimension => {
            if (dimension.index === dimensionIndex) {
                return {
                    ...dimension,
                    questions: [...(dimension.questions || []), ...questions]
                };
            }
            return dimension;
        });

        const newFeedback = { ...feedback, dimensions: updatedDimensions };
        dispatch(updateFeedback(newFeedback));
    };

    const handleEdit = (dimensionIndex: number, questionIndex: number) => {
        const dimension = feedback?.dimensions[dimensionIndex];
        if (!dimension) return;

        setEditMode(true);
        setEditDimension(dimension);
        setEditQuestion(dimension.questions[questionIndex]);
        setEditQuestionIndex(questionIndex);
        setOpen(true);
    };

    const handleEditSave = (dimensionIndex: number, questionIndex: number, newQuestion: string) => {
        if (!feedback) return;

        const updatedDimensions = feedback.dimensions.map((dimension, idx) => {
            if (idx === dimensionIndex) {
                const newQuestions = [...dimension.questions];
                newQuestions[questionIndex] = newQuestion;
                return {
                    ...dimension,
                    questions: newQuestions
                };
            }
            return dimension;
        });

        const newFeedback = { ...feedback, dimensions: updatedDimensions };
        dispatch(updateFeedback(newFeedback));
    };

    const handleDelete = (dimensionIndex: number, questionIndex: number) => {
        if (!feedback) return;

        const updatedDimensions = feedback.dimensions.map((dimension, idx) => {
            if (idx === dimensionIndex) {
                const newQuestions = [...dimension.questions];
                newQuestions.splice(questionIndex, 1);
                return {
                    ...dimension,
                    questions: newQuestions
                };
            }
            return dimension;
        });

        const newFeedback = { ...feedback, dimensions: updatedDimensions };
        dispatch(updateFeedback(newFeedback));
    };

    const renderTableRows = () => {
        if (!feedback?.dimensions) return null;

        return feedback.dimensions.map((dimension, dimensionIndex) => {
            if (!dimension.questions?.length) return null;

            return dimension.questions.map((question, questionIndex) => (
                <TableRow key={`${dimensionIndex}-${questionIndex}`}>
                    {questionIndex === 0 && (
                        <StyledTableCell 
                            rowSpan={dimension.questions.length}
                            sx={{ 
                                verticalAlign: 'middle',
                                backgroundColor: questionIndex % 2 === 0 ? '#fff' : '#f5f5f5'
                            }}
                        >
                            {dimension.name}
                        </StyledTableCell>
                    )}
                    <StyledTableCell sx={{ 
                        backgroundColor: questionIndex % 2 === 0 ? '#fff' : '#f5f5f5'
                    }}>
                        {question}
                    </StyledTableCell>
                    <StyledTableCell 
                        align="right" 
                        sx={{ 
                            backgroundColor: questionIndex % 2 === 0 ? '#fff' : '#f5f5f5'
                        }}
                    >
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(dimensionIndex, questionIndex)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(dimensionIndex, questionIndex)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </StyledTableCell>
                </TableRow>
            ));
        });
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
                            <StyledTableCell>Feedback Dimension</StyledTableCell>
                            <StyledTableCell>Feedback Question</StyledTableCell>
                            <StyledTableCell align="right" sx={{ width: '100px' }}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderTableRows()}
                        {(!feedback?.dimensions || feedback.dimensions.every(d => !d.questions?.length)) && (
                            <TableRow>
                                <StyledTableCell colSpan={3} align="center">
                                    No feedback questions added
                                </StyledTableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddFeedbackQuestion
                open={open}
                onClose={handleClose}
                dimensions={feedback?.dimensions || []}
                onSave={handleSaveQuestions}
                editMode={editMode}
                initialDimension={editDimension}
                initialQuestion={editQuestion}
                onEdit={handleEditSave}
                questionIndex={editQuestionIndex}
            />
        </Box>
    );
};

export default FeedbackQuestionsTab;
