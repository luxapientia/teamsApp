import React, { useState, useEffect } from 'react';
import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, Button, IconButton, Checkbox } from '@mui/material';
import { api } from '../../../../services/api';
import { riskColors } from '../../obligation/obligationModal';
import ArticleIcon from '@mui/icons-material/Article'; // Icon for comments/attachments
import ComplianceUpdateModal, { FileToUpload } from './ComplianceUpdateModal';
import CommentsAttachmentsViewModal from './CommentsAttachmentsViewModal'; // Import the new modal

interface Obligation {
    _id: string;
    complianceObligation: string;
    complianceArea: { areaName: string; }; // Assuming area is populated
    frequency: string;
    lastDueDate: string;
    owner: { name: string; }; // Assuming owner is populated
    riskLevel: string;
    status: string;
    complianceStatus?: 'Completed' | 'Not Completed'; // Add complianceStatus
    comments?: string;
    attachments?: { filename: string, filepath: string }[]; // Add attachments
}

interface QuarterObligationsDetailProps {
    year: number;
    quarter: string;
    onBack: () => void;
}

const QuarterObligationsDetail: React.FC<QuarterObligationsDetailProps> = ({ year, quarter, onBack }) => {
    const [obligations, setObligations] = useState<Obligation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
    const [commentsAttachmentsModalOpen, setCommentsAttachmentsModalOpen] = useState(false); // State for the new modal
    const [obligationForView, setObligationForView] = useState<Obligation | null>(null); // State for data in the new modal
    const [selectedObligations, setSelectedObligations] = useState<string[]>([]); // State for selected obligations

    useEffect(() => {
        const fetchObligations = async () => {
            try {
                const res = await api.get('/compliance-obligations');
                const activeObligations = (res.data.data || []).filter((ob: Obligation) => ob.status === 'Active');

                // TODO: Implement filtering by year and quarter dates
                setObligations(activeObligations);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching obligations:', err);
                setError('Failed to load obligations.');
                setLoading(false);
            }
        };

        fetchObligations();
    }, []);

    const handleOpenUpdateModal = (obligation: Obligation) => {
        setSelectedObligation(obligation);
        setUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setUpdateModalOpen(false);
        setSelectedObligation(null);
    };

    const handleSaveComplianceUpdate = async (obligationId: string, data: { complianceStatus: string, comments: string, filesToUpload: FileToUpload[], attachments: { filename: string, filepath: string }[] }) => {
        try {
            // 1. Upload new files first
            const uploadedFiles = await Promise.all(
                data.filesToUpload.map(async (fileData) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', fileData.file); // Append the actual File object

                        // Use the backend upload endpoint
                        const response = await api.post('/compliance-obligations/upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        // The backend /upload endpoint should return the final file metadata
                        // Assuming the backend returns { filename: string, filepath: string }
                        if (response.status === 200 && response.data && response.data.filename && response.data.filepath) {
                            return { filename: response.data.filename, filepath: response.data.filepath };
                        } else {
                            console.error('File upload failed for:', fileData.name, response);
                            return null; // Handle upload failure
                        }
                    } catch (error) {
                        console.error('Error uploading file:', error);
                        return null;
                    }
                })
            );

            // Filter out any upload failures
            const successfulUploads = uploadedFiles.filter(fileInfo => fileInfo !== null) as { filename: string, filepath: string }[];

            // 2. Combine existing attachments and newly uploaded attachments' info
            const finalAttachments = [...data.attachments, ...successfulUploads];

            // 3. Prepare data for the main obligation update (compliance status, comments, and all attachment metadata)
            const updatePayload = {
                complianceStatus: data.complianceStatus,
                comments: data.comments,
                attachments: finalAttachments, // Send the array of attachment metadata
            };

            // 4. Send the update payload to the dedicated update endpoint
            const res = await api.put(`/compliance-obligations/${obligationId}/update`, updatePayload);

            // Update the obligation in the state with the response data
            setObligations(prev => prev.map(ob => ob._id === obligationId ? res.data.data : ob));
            handleCloseUpdateModal();
        } catch (error) {
            console.error('Error saving compliance update:', error);
            // Optionally show an error message to the user
        }
    };

    const handleViewCommentsAttachments = (obligation: Obligation) => {
        setObligationForView(obligation);
        setCommentsAttachmentsModalOpen(true);
    };

    const handleCloseCommentsAttachmentsModal = () => {
        setCommentsAttachmentsModalOpen(false);
        setObligationForView(null);
    };

    const handleCheckboxChange = (obligationId: string) => {
        setSelectedObligations(prev =>
            prev.includes(obligationId)
                ? prev.filter(id => id !== obligationId)
                : [...prev, obligationId]
        );
    };

     const handleSubmitSelected = () => {
         // TODO: Implement backend call to update status of selectedObligations
         console.log('Submitting selected obligations:', selectedObligations);
         // After successful backend update, you would likely refetch the obligations
         // or update the local state to remove the submitted ones from this view.
     };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const allSelectableObligationIds = obligations.filter(
                ob => (ob.comments && ob.comments.length > 0) || (ob.attachments && ob.attachments.length > 0) && ob.complianceStatus !== undefined
            ).map(ob => ob._id);
            setSelectedObligations(allSelectableObligationIds);
        } else {
            setSelectedObligations([]);
        }
    };

    if (loading) {
        return <Typography>Loading obligations...</Typography>;
    } else if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    const canSubmit = selectedObligations.length > 0;
    const selectableObligations = obligations.filter(
        ob => (ob.comments && ob.comments.length > 0) || (ob.attachments && ob.attachments.length > 0) && ob.complianceStatus !== undefined
    );
    const isAllSelected = selectableObligations.length > 0 && selectedObligations.length === selectableObligations.length;

    return (
        <Box sx={{ mt: 2 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    variant="outlined"
                    onClick={onBack}
                    sx={{
                        textTransform: 'none',
                        borderColor: '#DC2626',
                        color: '#DC2626',
                        '&:hover': {
                            borderColor: '#B91C1C',
                            backgroundColor: 'rgba(220, 38, 38, 0.04)',
                        }
                    }}
                >
                    Back
                </Button>
                 <Button
                     variant="contained"
                     onClick={handleSubmitSelected}
                     disabled={!canSubmit}
                     sx={{
                         textTransform: 'none',
                         backgroundColor: '#10B981', // Green color
                         '&:hover': {
                             backgroundColor: '#059669', // Darker green on hover
                         },
                         '&:disabled': {
                            backgroundColor: '#9CA3AF', // Gray when disabled
                            color: '#E5E7EB', // Light gray text when disabled
                         },
                     }}
                 >
                     Submit
                 </Button>
             </Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Active Compliance Obligations for {quarter} {year}</Typography>

            {!obligations.length ? (
                <Typography>No active obligations found for this quarter.</Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: '1px solid #E5E7EB', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                     <Checkbox
                                         indeterminate={selectedObligations.length > 0 && selectedObligations.length < selectableObligations.length}
                                         checked={isAllSelected}
                                         onChange={handleSelectAllClick}
                                         disabled={selectableObligations.length === 0} // Disable select all if no rows are selectable
                                     />
                                </TableCell>
                                <TableCell>Compliance Obligation</TableCell>
                                <TableCell>Frequency</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Risk Level</TableCell>
                                <TableCell>Compliance Status</TableCell>
                                <TableCell align='center'>Comments</TableCell>
                                <TableCell align='center'>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {obligations.map(obligation => {
                                const hasCommentsOrAttachments = (obligation.comments && obligation.comments.length > 0) || (obligation.attachments && obligation.attachments.length > 0);
                                const canSelect = hasCommentsOrAttachments && obligation.complianceStatus !== undefined; // Checkbox appears if comments/attachments exist AND complianceStatus is set

                                return (
                                    <TableRow key={obligation._id} hover>
                                         <TableCell padding="checkbox">
                                            {canSelect && (
                                                <Checkbox
                                                    checked={selectedObligations.includes(obligation._id)}
                                                    onChange={() => handleCheckboxChange(obligation._id)}
                                                />
                                            )}
                                        </TableCell>
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
                                                        backgroundColor: riskColors[obligation.riskLevel] || 'gray', // Default to gray if risk level is not mapped
                                                        mr: 1, // Margin right for spacing
                                                    }}
                                                />
                                                {obligation.riskLevel}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: obligation.complianceStatus === 'Completed' ? 'green' : (obligation.complianceStatus === 'Not Completed' ? 'red' : 'inherit') }}>
                                            {obligation.complianceStatus || 'N/A'}
                                        </TableCell>
                                        <TableCell align='center'>
                                             {hasCommentsOrAttachments ? (
                                                <IconButton size="small" onClick={() => handleViewCommentsAttachments(obligation)}>
                                                     <ArticleIcon fontSize="small" />
                                                </IconButton>
                                            ) : (
                                                '-' // Show a dash if no comments/attachments
                                            )}
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Button variant="outlined" size="small" onClick={() => handleOpenUpdateModal(obligation)}>Update</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Compliance Update Modal */}
            <ComplianceUpdateModal
                open={updateModalOpen}
                onClose={handleCloseUpdateModal}
                onSave={handleSaveComplianceUpdate}
                obligation={selectedObligation}
            />

            {/* Comments/Attachments View Modal */}
            <CommentsAttachmentsViewModal
                open={commentsAttachmentsModalOpen}
                onClose={handleCloseCommentsAttachmentsModal}
                obligation={obligationForView}
            />

        </Box>
    );
};

export default QuarterObligationsDetail;