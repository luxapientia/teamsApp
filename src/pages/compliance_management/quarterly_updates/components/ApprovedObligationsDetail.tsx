import React, { useState, useEffect } from 'react';
import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, Button, IconButton } from '@mui/material';
import { api } from '../../../../services/api';
import { riskColors } from '../../obligation/obligationModal';
import ArticleIcon from '@mui/icons-material/Article'; // Icon for comments/attachments
import CommentsAttachmentsViewModal from './CommentsAttachmentsViewModal'; // Import the view modal

interface Attachment {
    filename: string;
    filepath: string;
}

interface UpdateEntry {
    year: string;
    quarter: string;
    comments?: string;
    attachments?: Attachment[];
}

interface Obligation {
    _id: string;
    complianceObligation: string;
    complianceArea: { areaName: string; }; // Assuming area is populated
    frequency: string;
    lastDueDate: string;
    owner: { name: string; }; // Assuming owner is populated
    riskLevel: string;
    status: string;
    tenantId: string;
    complianceStatus?: 'Completed' | 'Not Completed';
    update?: UpdateEntry[];
}

interface ApprovedObligationsDetailProps {
    year: number;
    quarter: string;
    onBack: () => void;
}

const ApprovedObligationsDetail: React.FC<ApprovedObligationsDetailProps> = ({ year, quarter, onBack }) => {
    const [obligations, setObligations] = useState<Obligation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [obligationForView, setObligationForView] = useState<Obligation | null>(null); // State for data in the comments/attachments modal
    const [commentsAttachmentsModalOpen, setCommentsAttachmentsModalOpen] = useState(false); // State for comments/attachments modal

    useEffect(() => {
        const fetchObligations = async () => {
            try {
                const res = await api.get('/compliance-obligations');
                const allObligations: Obligation[] = res.data.data || [];

                // Filter obligations that have an update entry for the specified year and quarter
                const filteredObligations = allObligations.filter(ob => 
                     ob.update?.some(u => u.year === year.toString() && u.quarter === quarter)
                 );

                setObligations(filteredObligations);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching obligations:', err);
                setError('Failed to load obligations.');
                setLoading(false);
            }
        };

        fetchObligations();
    }, [year, quarter]); // Re-run effect if year or quarter changes

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
        </Box>
    );
};

export default ApprovedObligationsDetail; 