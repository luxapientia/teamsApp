import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    styled,
    IconButton,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PageProps } from '../../types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import { RootState } from '../../store';
import { useAppSelector } from '../../hooks/useAppSelector';
import FeedbackDetails from './FeedbackDetails';
import { Feedback as FeedbackType } from '../../types';
import { deleteFeedback, updateFeedback, createFeedback, fetchFeedback } from '../../store/slices/feedbackSlice';
import { StyledTableCell, StyledHeaderCell } from '../../components/StyledTableComponents';

const ViewButton = styled(Button)({
    textTransform: 'none',
    backgroundColor: '#0078D4',
    color: 'white',
    '&:hover': {
        backgroundColor: '#106EBE',
    },
});

const Feedback: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
    const dispatch = useAppDispatch();
    const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
    const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
    const [showTable, setShowTable] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackType>({
        _id: '',
        name: '',
        status: 'Active',
        hasContent: false,
        annualTargetId: '',
        tenantId: '',
        dimensions: [],
        responses: [],
        enableFeedback: [
            {
                quarter: 'Q1',
                enable: false,
            },
            {
                quarter: 'Q2',
                enable: false,
            },
            {
                quarter: 'Q3',
                enable: false,
            },
            {
                quarter: 'Q4',
                enable: false,
            },
        ],
    });
    const feedbackList = useAppSelector((state: RootState) => state.feedback.feedbacks.filter((feedback) => feedback.annualTargetId === selectedAnnualTargetId));
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        dispatch(fetchAnnualTargets());
        dispatch(fetchFeedback());
    }, [dispatch]);

    const handleScorecardChange = (event: SelectChangeEvent) => {
        setSelectedAnnualTargetId(event.target.value);
        setShowTable(false);
    };

    const handleView = (feedback: FeedbackType) => {
        setSelectedFeedback(feedback);
        setShowTable(false);
        setShowDetails(true);
        handleMenuClose();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, feedback: FeedbackType) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedFeedback(feedback);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedFeedback(null);
    };

    const handleOpen = () => {
        if (selectedFeedback) {
            // Handle open action
            handleMenuClose();
        }
    };

    const handleEdit = () => {
        if (selectedFeedback) {
            setFeedback(selectedFeedback);
            setIsEditMode(true);
            setIsModalOpen(true);
            handleMenuClose();
        }
    };

    const handleDelete = () => {
        if (selectedFeedback && !selectedFeedback.hasContent) {
            dispatch(deleteFeedback(selectedFeedback._id));
            dispatch(fetchFeedback());
            handleMenuClose();
        }
    };

    const handleSave = () => {
        if (feedback.name.trim()) {
            if (isEditMode) {
                console.log('feedback', feedback);
                dispatch(updateFeedback({...feedback, annualTargetId: selectedAnnualTargetId}));
            } else {
                dispatch(createFeedback({...feedback, annualTargetId: selectedAnnualTargetId}));
            }
            handleCloseModal();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFeedback({
            _id: '',
            name: '',
            status: 'Active',
            hasContent: false,
            annualTargetId: '',
            tenantId: '',
            dimensions: [],
            responses: [],
            enableFeedback: [
                {
                    quarter: 'Q1',
                    enable: false,
                },
                {
                    quarter: 'Q2',
                    enable: false,
                },
                {
                    quarter: 'Q3',
                    enable: false,
                },
                {
                    quarter: 'Q4',
                    enable: false,
                },
            ],
        });
        setIsEditMode(false);
    };

    const handleBack = () => {
        setShowDetails(false);
        setSelectedFeedback(null);
        setShowTable(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl fullWidth>
                    <Select
                        value={selectedAnnualTargetId}
                        onChange={handleScorecardChange}
                        displayEmpty
                        sx={{ backgroundColor: '#fff' }}
                    >
                        {annualTargets.map((target) => (
                            <MenuItem key={target._id} value={target._id}>
                                {target.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    onClick={() => setShowTable(true)}
                    disabled={!selectedAnnualTargetId}
                    sx={{
                        backgroundColor: '#0078D4',
                        '&:hover': { backgroundColor: '#106EBE' },
                    }}
                >
                    View
                </Button>
            </Box>

            {showTable && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Employee 360 Degree Feedback Name</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsModalOpen(true)}
                            sx={{
                                backgroundColor: '#0078D4',
                                '&:hover': { backgroundColor: '#106EBE' },
                            }}
                        >
                            New
                        </Button>
                    </Box>

                    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledHeaderCell>Employee 360 Degree Feedback Name</StyledHeaderCell>
                                    <StyledHeaderCell>Status</StyledHeaderCell>
                                    <StyledHeaderCell align="right">Actions</StyledHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feedbackList.map((feedback, index) => (
                                    <TableRow key={index}>
                                        <StyledTableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                {feedback.name}
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, feedback)}
                                                    sx={{ ml: 1 }}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </StyledTableCell>
                                        <StyledTableCell>{feedback.status}</StyledTableCell>
                                        <StyledTableCell align="right">
                                            <ViewButton
                                                size="small"
                                                onClick={() => handleView(feedback)}
                                            >
                                                View
                                            </ViewButton>
                                        </StyledTableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleOpen}>
                            <ListItemIcon>
                                <OpenInNewIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Open</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleEdit}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Edit</ListItemText>
                        </MenuItem>
                        <MenuItem
                            onClick={handleDelete}
                            disabled={selectedFeedback?.hasContent}
                        >
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Delete</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            )}

            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #E5E7EB',
                    pb: 2
                }}>
                    <Typography variant="h6">
                        {isEditMode ? 'Edit Employee 360 Degree Feedback' : 'Employee 360 Degree Feedback'}
                    </Typography>
                    <Button
                        onClick={handleCloseModal}
                        sx={{ minWidth: 'auto', p: 1 }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Employee 360 Degree Feedback"
                            value={feedback.name}
                            onChange={(e) => {
                                setFeedback({ ...feedback, name: e.target.value });
                            }}
                        />
                        <FormControl fullWidth>
                            <Select
                                value={feedback.status}
                                onChange={(e) => {
                                    setFeedback({ ...feedback, status: e.target.value as 'Active' | 'Not Active' });
                                }}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Not Active">Not Active</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!feedback.name.trim()}
                        sx={{
                            backgroundColor: '#0078D4',
                            '&:hover': { backgroundColor: '#106EBE' },
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            {showDetails && selectedFeedback && (
                <FeedbackDetails feedbackId={selectedFeedback._id} onBack={handleBack} />
            )}
        </Box>
    );
};

export default Feedback; 
