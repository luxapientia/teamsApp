import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Select,
    MenuItem,
    IconButton,
    SelectChangeEvent,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    InputAdornment,
    Autocomplete,
    Tooltip,
    Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Feedback,
    FeedbackDimension,
    PersonalPerformance,
    QuarterType,
    PersonalQuarterlyTargetFeedback,
} from '../../../types';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';
import { ViewButton, StyledTableCell, StyledHeaderCell } from '../../../components/StyledTableComponents';
import { api } from '../../../services/api';
import { updatePersonalPerformance } from '../../../store/slices/personalPerformanceSlice';
import { useToast } from '../../../contexts/ToastContext';

interface Props {
    quarter: QuarterType;
    annualTargetId: string;
    personalPerformance: PersonalPerformance;
}

type ProviderType = 'Internal' | 'External';

type FeedbackProvider = {
    id: string;
    name: string;
    email: string;
    category: string;
    status: string;
}

interface AddProviderForm {
    type: ProviderType;
    name: string;
    email?: string;
    category: FeedbackProvider['category'];
}

const PersonalFeedback: React.FC<Props> = ({ quarter, annualTargetId, personalPerformance }) => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();
    const [selectedFeedbackId, setSelectedFeedbackId] = useState<string>('');
    const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<{
        dimension: string;
        question: string;
        responses: {
            provider: {
                name: string;
                category: string;
            };
            response: {
                score: number;
                response: string;
            };
            reason: string;
        }[];
    } | null>(null);
    const [providerForm, setProviderForm] = useState<AddProviderForm>({
        type: 'Internal',
        name: '',
        email: '',
        category: 'Peer'
    });
    const [organizationMembers, setOrganizationMembers] = useState<{ name: string, email: string }[]>([]);
    const [emailError, setEmailError] = useState<string>('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const annualTarget = useAppSelector((state: RootState) => state.scorecard.annualTargets.find(at => at._id === annualTargetId));

    const feedbacks = useAppSelector((state: RootState) =>
        state.feedback.feedbacks.filter(f =>
            f.annualTargetId === annualTargetId &&
            f.enableFeedback.some(ef => ef.quarter === quarter && ef.enable)
        )
    );

    useEffect(() => {
        const fetchOrganizationMembers = async () => {
            try {
                const response = await api.get('/users/organization/users');
                if (response.data.status === 'success') {
                    setOrganizationMembers(response.data.data.map((user: any) => ({
                        name: user.displayName,
                        email: user.mail
                    })));
                }
            } catch (error) {
                console.error('Error fetching organization members:', error);
            }
        };
        fetchOrganizationMembers();
    }, []);

    useEffect(() => {
        if (feedbacks.length > 0 && !selectedFeedbackId) {
            const firstFeedback = feedbacks[0];
            setSelectedFeedbackId(firstFeedback._id);
        }
    }, [feedbacks]);

    const handleFeedbackChange = (event: SelectChangeEvent<string>) => {
        const newValue = event.target.value;
        setSelectedFeedbackId(newValue);
    };

    const handleAddProviderClose = () => {
        setIsAddProviderOpen(false);
        setProviderForm({
            type: 'Internal',
            name: '',
            email: '',
            category: 'Peer'
        });
    };

    const handleProviderTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProviderForm({
            ...providerForm,
            type: event.target.value as ProviderType,
            name: '',
            email: ''
        });
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setProviderForm({ ...providerForm, email: newEmail });
        validateEmail(newEmail);
    };

    const handleSaveProvider = async () => {
        if (validateEmail(providerForm.email || '')) {
            const newFeedback: PersonalQuarterlyTargetFeedback = {
                feedbackId: selectedFeedbackId,
                provider: {
                    name: providerForm.name,
                    email: providerForm.email,
                    category: providerForm.category,
                    status: 'Not Shared'
                },
                feedbacks: []
            };

            const updatedPersonalPerformance = {
                ...personalPerformance,
                quarterlyTargets: personalPerformance.quarterlyTargets.map(target =>
                    target.quarter === quarter
                        ? {
                            ...target,
                            feedbacks: [...(target.feedbacks || []), newFeedback]
                        }
                        : target
                )
            };

            dispatch(updatePersonalPerformance(updatedPersonalPerformance));
            handleAddProviderClose();
        }
    };

    const calculateOverallScore = () => {
        const target = personalPerformance.quarterlyTargets.find(t => t.quarter === quarter);
        const feedbackResponses = target?.feedbacks.filter(f => f.feedbackId === selectedFeedbackId) || [];
        const feedbackTemplate = feedbacks.find(f => f._id === selectedFeedbackId);
        
        if (!feedbackTemplate || feedbackResponses.length === 0) return '-';

        let totalWeightedScore = 0;
        let totalWeight = 0;

        feedbackTemplate.dimensions.forEach(dimension => {
            const dimensionScore =  calculateAverageScore(dimension.name);
            if (dimensionScore !== '-') {
                const score = parseFloat(dimensionScore);
                totalWeightedScore += score * (dimension.weight / 100);
                totalWeight += dimension.weight / 100;
            }
        });

        if (totalWeight === 0) return '-';
        return totalWeightedScore.toFixed(1);
    };

    const handleDeleteProvider = (feedbackId: string, providerEmail: string) => {
        const updatedPersonalPerformance = {
            ...personalPerformance,
            quarterlyTargets: personalPerformance.quarterlyTargets.map(target => 
                target.quarter === quarter
                    ? {
                        ...target,
                        feedbacks: target.feedbacks.filter(feedback => 
                            !(feedback.feedbackId === feedbackId && feedback.provider.email === providerEmail)
                        )
                    }
                    : target
            )
        };

        dispatch(updatePersonalPerformance(updatedPersonalPerformance));
    };

    const handleViewFeedback = (dimension: string, question: string) => {
        const target = personalPerformance.quarterlyTargets.find(t => t.quarter === quarter);
        const feedbacks = target?.feedbacks.filter(f => f.feedbackId === selectedFeedbackId) || [];
        
        const responses = feedbacks.map(feedback => ({
            provider: {
                name: feedback.provider.name,
                category: feedback.provider.category
            },
            response: feedback.feedbacks.find(f => 
                f.dimension === dimension && f.question === question
            )?.response || { score: 0, response: '' },
            reason: feedback.feedbacks.find(f => 
                f.dimension === dimension && f.question === question
            )?.reason || ''
        }));

        setSelectedQuestion({
            dimension,
            question,
            responses
        });
        setIsViewModalOpen(true);
    };

    const calculateAverageScore = (dimension: string) => {
        const target = personalPerformance.quarterlyTargets.find(t => t.quarter === quarter);
        const feedbackResponses = target?.feedbacks.filter(f => f.feedbackId === selectedFeedbackId) || [];
        const feedbackTemplate = feedbacks.find(f => f._id === selectedFeedbackId);
        
        if (!feedbackTemplate || feedbackResponses.length === 0) return '-';

        let totalScore = 0;
        let totalResponses = 0;

        // Get all questions for this dimension
        const dimensionQuestions = feedbackTemplate.dimensions
            .find(d => d.name === dimension)?.questions || [];

        // For each question in the dimension
        dimensionQuestions.forEach(question => {
            feedbackResponses.forEach(feedback => {
                const response = feedback.feedbacks.find(f => 
                    f.dimension === dimension && f.question === question
                );
                if (response?.response.score) {
                    totalScore += response.response.score;
                    totalResponses++;
                }
            });
        });

        if (totalResponses === 0) return '-';
        return (totalScore / totalResponses).toFixed(1);
    };

    const handleShareFeedback = async () => {
        setIsSharing(true);
        const personalFeedbacks = personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.feedbacks.filter(f => f.feedbackId === selectedFeedbackId);
        try {
            await Promise.all(personalFeedbacks.map(async (feedback) => {
                if(feedback.provider.status === 'Not Shared') {
                    const provider = feedback.provider;
                    const response = await api.post('/feedback/share-feedback', { feedbackId: feedback._id, provider});
                    if(response.status === 200) {
                        showToast('360 Degree Feedback has been shared.', 'success');
                    } else {
                        showToast('Failed to share feedback', 'error');
                    }
                }
            }));
        } catch (error) {
            console.error('Error sharing feedback:', error);
            showToast('Failed to share feedback', 'error');
        } finally {
            setIsSharing(false);
        }
    };

    const isWithinAssessmentPeriod = () => {
        const endDate = annualTarget?.content.assessmentPeriod[quarter as keyof typeof annualTarget.content.assessmentPeriod].endDate;
        const currentDate = new Date();
        return currentDate <= new Date(endDate);
    }

    if (feedbacks.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="body1" color="textSecondary">
                    No feedback available for this quarter.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Select
                    value={selectedFeedbackId}
                    onChange={handleFeedbackChange}
                    fullWidth
                    sx={{ backgroundColor: '#fff' }}
                >
                    {feedbacks.map(feedback => (
                        <MenuItem key={feedback._id} value={feedback._id}>
                            {feedback.name}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => setIsAddProviderOpen(true)}
                    sx={{
                        backgroundColor: '#0078D4',
                        '&:hover': { backgroundColor: '#106EBE' },
                    }}
                >
                    + Add Feedback Provider
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        color: '#0078D4',
                        borderColor: '#0078D4',
                        '&:hover': {
                            borderColor: '#106EBE',
                            backgroundColor: 'rgba(0, 120, 212, 0.04)',
                        },
                    }}
                    disabled={!isWithinAssessmentPeriod() || isSharing}
                    onClick={handleShareFeedback}   
                >
                    {isSharing ? 'Sharing...' : 'Share'}
                </Button>
            </Box>

            <Paper sx={{ mb: 3, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledHeaderCell align="center">Name</StyledHeaderCell>
                            <StyledHeaderCell align="center">Category</StyledHeaderCell>
                            <StyledHeaderCell align="center">Status</StyledHeaderCell>
                            <StyledHeaderCell align="center">Actions</StyledHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.feedbacks?.filter(f => f.feedbackId === selectedFeedbackId).map((feedback, index) => (
                            <TableRow key={index}>
                                <StyledTableCell>{feedback.provider.name}</StyledTableCell>
                                <StyledTableCell align="center">{feedback.provider.category}</StyledTableCell>
                                <StyledTableCell align="center">{feedback.provider.status}</StyledTableCell>
                                <StyledTableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        {/* <Tooltip title="Copy feedback link">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopyLink(feedback._id)}
                                                sx={{ color: '#0078D4' }}
                                            >
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip> */}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteProvider(feedback.feedbackId, feedback.provider.email)}
                                            sx={{ color: '#DC2626' }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Paper sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledHeaderCell align="center">Feedback Dimension</StyledHeaderCell>
                            <StyledHeaderCell align="center">Weight %</StyledHeaderCell>
                            <StyledHeaderCell align="center">Average Rating Score</StyledHeaderCell>
                            <StyledHeaderCell align="center">Feedback Question</StyledHeaderCell>
                            <StyledHeaderCell align="center">Feedback Response</StyledHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {feedbacks.find(f => f._id === selectedFeedbackId)?.dimensions.map((dimension, index) => {
                            return (
                                <React.Fragment key={index}>
                                    {dimension.questions.map((question, qIndex) => {
                                        const responses = feedbacks.find(f => f._id === selectedFeedbackId)?.responses.filter(r => r.response !== undefined);

                                        return (
                                            <TableRow key={`${dimension.index}-${qIndex}`}>
                                                {qIndex === 0 && (
                                                    <>
                                                        <StyledTableCell rowSpan={dimension.questions.length} align="center">
                                                            {dimension.name}
                                                        </StyledTableCell>
                                                        <StyledTableCell rowSpan={dimension.questions.length} align="center">
                                                            {dimension.weight}
                                                        </StyledTableCell>
                                                        <StyledTableCell rowSpan={dimension.questions.length} align="center">
                                                            {calculateAverageScore(dimension.name)}
                                                        </StyledTableCell>
                                                    </>
                                                )}
                                                <StyledTableCell align="center">{question}</StyledTableCell>
                                                <StyledTableCell align="center">
                                                    <ViewButton onClick={() => handleViewFeedback(dimension.name, question)}>VIEW</ViewButton>
                                                </StyledTableCell>
                                            </TableRow>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}

                        <TableRow>
                            <StyledTableCell colSpan={2} sx={{ fontWeight: 500 }}>
                                Overall 360 Degree Feedback Score
                            </StyledTableCell>
                            <StyledTableCell colSpan={3} align="center">
                                {calculateOverallScore()}
                            </StyledTableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>

            <Dialog
                open={isAddProviderOpen}
                onClose={handleAddProviderClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Add Feedback Provider
                        <IconButton onClick={handleAddProviderClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <RadioGroup
                            row
                            value={providerForm.type}
                            onChange={handleProviderTypeChange}
                            sx={{ mb: 2 }}
                        >
                            <FormControlLabel value="Internal" control={<Radio />} label="Internal" />
                            <FormControlLabel value="External" control={<Radio />} label="External" />
                        </RadioGroup>

                        {providerForm.type === 'Internal' ? (
                            <Autocomplete
                                options={organizationMembers}
                                getOptionLabel={(option) => `${option.name} (${option.email})`}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        setProviderForm({
                                            ...providerForm,
                                            name: newValue.name,
                                            email: newValue.email
                                        });
                                        validateEmail(newValue.email);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        placeholder="Search people"
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                                sx={{ mb: 2 }}
                            />
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={providerForm.name}
                                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={providerForm.email}
                                    onChange={handleEmailChange}
                                    error={!!emailError}
                                    helperText={emailError}
                                    required
                                    sx={{ mb: 2 }}
                                />
                            </>
                        )}

                        <FormControl fullWidth>
                            <Select
                                value={providerForm.category}
                                onChange={(e) => setProviderForm({ ...providerForm, category: e.target.value as FeedbackProvider['category'] })}
                                required
                            >
                                <MenuItem value="Supervisor">Supervisor</MenuItem>
                                <MenuItem value="Direct Report">Direct Report</MenuItem>
                                <MenuItem value="Peer">Peer</MenuItem>
                                <MenuItem value="Self">Self</MenuItem>
                                <MenuItem value="Stakeholder">Stakeholder</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddProviderClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveProvider}
                        disabled={!providerForm.name || !providerForm.email || !!emailError}
                        sx={{
                            backgroundColor: '#0078D4',
                            '&:hover': { backgroundColor: '#106EBE' },
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Feedback Modal */}
            <Dialog
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6">
                                Feedback Responses
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                {selectedQuestion?.question}
                            </Typography>
                        </Box>
                        <IconButton onClick={() => setIsViewModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedQuestion && (
                        <Box sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <StyledHeaderCell>Provider</StyledHeaderCell>
                                        <StyledHeaderCell>Category</StyledHeaderCell>
                                        <StyledHeaderCell>Response</StyledHeaderCell>
                                        <StyledHeaderCell>Reason</StyledHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedQuestion.responses.map((response, index) => (
                                        <TableRow key={index}>
                                            <StyledTableCell>{response.provider.name}</StyledTableCell>
                                            <StyledTableCell>{response.provider.category}</StyledTableCell>
                                            <StyledTableCell>
                                                {response.response.score} - {response.response.response}
                                            </StyledTableCell>
                                            <StyledTableCell>{response.reason}</StyledTableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsViewModalOpen(false)}
                        sx={{
                            color: '#374151',
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message="Feedback link copied to clipboard"
            />
        </Box>
    );
};

export default PersonalFeedback;
