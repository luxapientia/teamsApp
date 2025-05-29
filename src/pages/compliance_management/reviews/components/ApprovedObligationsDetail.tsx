import React, { useState, useEffect } from 'react';
import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, Button, IconButton } from '@mui/material';
import { api } from '../../../../services/api';
import { riskColors } from '../../obligation/obligationModal';
import ArticleIcon from '@mui/icons-material/Article'; // Icon for comments/attachments
import CommentsAttachmentsViewModal from './CommentsAttachmentsViewModal'; // Import the view modal
import { Toast } from '../../../../components/Toast';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { fetchComplianceObligations } from '../../../../store/slices/complianceObligationsSlice';
import { Obligation, AssessmentStatus } from '../../../../types/compliance';

interface ApprovedObligationsDetailProps {
    year: number;
    quarter: string;
    onBack: () => void;
}

const ApprovedObligationsDetail: React.FC<ApprovedObligationsDetailProps> = ({ year, quarter, onBack }) => {
    const dispatch = useAppDispatch();
    const { obligations: allObligations } = useAppSelector(state => state.complianceObligations);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [obligationForView, setObligationForView] = useState<Obligation | null>(null); // State for data in the comments/attachments modal
    const [commentsAttachmentsModalOpen, setCommentsAttachmentsModalOpen] = useState(false); // State for comments/attachments modal
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Filter obligations that have an update entry for the specified year and quarter and are approved
    const obligations = allObligations.filter(ob =>
        ob.update?.some(u => 
            u.year === year.toString() && 
            u.quarter === quarter && 
            u.assessmentStatus === AssessmentStatus.Approved
        )
    );

    useEffect(() => {
        const loadObligations = async () => {
            try {
                await dispatch(fetchComplianceObligations()).unwrap();
                setLoading(false);
            } catch (err) {
                console.error('Error fetching obligations:', err);
                setError('Failed to load obligations.');
                setLoading(false);
            }
        };

        loadObligations();
    }, [dispatch]);

    const handleViewCommentsAttachments = (obligation: Obligation) => {
        setObligationForView(obligation);
        setCommentsAttachmentsModalOpen(true);
    };

    const handleCloseCommentsAttachmentsModal = () => {
        setCommentsAttachmentsModalOpen(false);
        setObligationForView(null);
    };

    if (loading) {
        return <Typography>Loading approved obligations...</Typography>;
    } else if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ mt: 2 }}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <Button
                variant="outlined"
                onClick={onBack}
                sx={{
                    textTransform: 'none',
                    borderColor: '#DC2626',
                    color: '#DC2626',
                    mb: 2,
                    '&:hover': {
                        borderColor: '#B91C1C',
                        backgroundColor: 'rgba(220, 38, 38, 0.04)',
                    }
                }}
            >
                Back
            </Button>
            <Typography variant="h6" gutterBottom>Approved Compliance Obligations for {quarter} {year}</Typography>

            {!obligations.length ? (
                <Typography>No approved obligations found for this quarter.</Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: '1px solid #E5E7EB', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Compliance Obligation</TableCell>
                                <TableCell>Frequency</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Risk Level</TableCell>
                                <TableCell>Compliance Status</TableCell>
                                <TableCell align='center'>Comments/Attachments</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {obligations.map(obligation => {
                                // Find the relevant update entry for the displayed quarter
                                const displayQuarterUpdate = obligation.update?.find(u => u.year === year.toString() && u.quarter === quarter);

                                // Determine if comments/attachments icon should be shown based on the specific quarter's update entry
                                const hasCommentsOrAttachmentsForQuarter = (displayQuarterUpdate?.comments && displayQuarterUpdate.comments.length > 0) || (displayQuarterUpdate?.attachments && displayQuarterUpdate.attachments.length > 0);

                                return (
                                    <TableRow key={obligation._id} hover>
                                        <TableCell>{obligation.complianceObligation}</TableCell>
                                        <TableCell>{obligation.frequency}</TableCell>
                                        <TableCell>{typeof obligation.owner === 'object' ? obligation.owner.name : obligation.owner}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        backgroundColor: riskColors[obligation.riskLevel] || 'gray',
                                                        mr: 1,
                                                    }}
                                                />
                                                {obligation.riskLevel}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: obligation.complianceStatus === 'Completed' ? 'green' : (obligation.complianceStatus === 'Not Completed' ? 'red' : 'inherit') }}>
                                            {obligation.complianceStatus || 'N/A'}
                                        </TableCell>
                                        <TableCell align='center'>
                                            {hasCommentsOrAttachmentsForQuarter ? (
                                                <IconButton size="small" onClick={() => handleViewCommentsAttachments(obligation)}>
                                                    <ArticleIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {/* Comments/Attachments View Modal */}
            <CommentsAttachmentsViewModal
                open={commentsAttachmentsModalOpen}
                onClose={handleCloseCommentsAttachmentsModal}
                obligation={obligationForView}
                year={year}
                quarter={quarter}
            />
        </Box>
    );
};

export default ApprovedObligationsDetail; 