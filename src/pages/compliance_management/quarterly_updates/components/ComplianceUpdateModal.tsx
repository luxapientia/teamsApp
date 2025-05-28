import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
    Typography,
    IconButton,
    Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../../../services/api';

interface Obligation {
    _id: string;
    complianceObligation: string;
    complianceArea: { areaName: string; };
    frequency: string;
    lastDueDate: string;
    owner: { name: string; };
    riskLevel: string;
    status: string;
    complianceStatus?: 'Completed' | 'Not Completed';
    comments?: string;
    attachments?: { filename: string, filepath: string }[];
}

interface ComplianceUpdateModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (obligationId: string, data: { complianceStatus: string, comments: string, filesToUpload: FileToUpload[], attachments: { filename: string, filepath: string }[] }) => void;
    obligation: Obligation | null;
}

export interface FileToUpload {
    file: File;
    name: string;
}

const ComplianceUpdateModal: React.FC<ComplianceUpdateModalProps> = ({ open, onClose, onSave, obligation }) => {
    const [complianceStatus, setComplianceStatus] = useState('Not Completed');
    const [comments, setComments] = useState('');
    const [attachments, setAttachments] = useState<{ filename: string, filepath: string }[]>([]);
    const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);

    useEffect(() => {
        if (open && obligation) {
            setComplianceStatus(obligation.complianceStatus || 'Not Completed');
            setComments(obligation.comments || '');
            setAttachments(obligation.attachments || []);
            setFilesToUpload([]);
        }
    }, [open, obligation]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFiles: FileToUpload[] = [];
            const newAttachments = [...attachments];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                newFiles.push({
                    file,
                    name: file.name
                });
                newAttachments.push({
                    filename: file.name,
                    filepath: URL.createObjectURL(file)
                });
            }

            setFilesToUpload(prev => [...prev, ...newFiles]);
            setAttachments(newAttachments);
        }
    };

    const handleSave = () => {
        if (obligation) {
            onSave(obligation._id, { complianceStatus, comments, filesToUpload, attachments });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#111827' }}>Compliance Update</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: '#6B7280' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: '#4B5563' }}>Obligation: {obligation?.complianceObligation}</Typography>
                </Box>

                <FormControl fullWidth margin="normal" sx={{
                    backgroundColor: '#F9FAFB',
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#E5E7EB' },
                    }
                }}>
                    <InputLabel>Compliance Status</InputLabel>
                    <Select
                        value={complianceStatus}
                        onChange={e => setComplianceStatus(e.target.value as 'Completed' | 'Not Completed')}
                        label="Compliance Status"
                        size="small"
                    >
                        {['Completed', 'Not Completed'].map(statusOption => (
                            <MenuItem key={statusOption} value={statusOption}>{statusOption}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Comments"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{
                        backgroundColor: '#F9FAFB',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#E5E7EB' },
                        }
                    }}
                />

                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#374151', mb: 2 }}>Attachments</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {attachments.map((attachment, index) => (
                            <Grid key={index} component="div" sx={{ mb: 1 }} >
                                <Box
                                    sx={{
                                        border: '1px solid #E5E7EB',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        height: '150px',
                                        position: 'relative',
                                        '&:hover .delete-button': {
                                            opacity: 1,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100px',
                                            backgroundColor: '#F3F4F6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <InsertDriveFileIcon sx={{ fontSize: 48, color: '#6B7280' }} />
                                    </Box>
                                    <Box sx={{ p: 2 }}>
                                        <Typography
                                            sx={{
                                                color: '#374151',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {attachment.filename}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        className="delete-button"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            color: '#DC2626',
                                            backgroundColor: 'white',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            '&:hover': {
                                                backgroundColor: '#FEE2E2',
                                            }
                                        }}
                                        onClick={() => {
                                            const newAttachments = attachments.filter((_, i) => i !== index);
                                            setAttachments(newAttachments);
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<AddIcon />}
                            sx={{
                                color: '#6B7280',
                                borderColor: '#E5E7EB',
                                '&:hover': {
                                    borderColor: '#D1D5DB',
                                    backgroundColor: '#F9FAFB',
                                }
                            }}
                        >
                            Add attachment
                        </Button>
                    </label>
                </Box>

            </Box>
            <DialogActions sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, p: 3 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: '#374151',
                        borderColor: '#E5E7EB',
                        textTransform: 'none',
                        '&:hover': {
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F9FAFB',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{
                        backgroundColor: '#6264A7',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#4F46E5',
                        }
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ComplianceUpdateModal; 