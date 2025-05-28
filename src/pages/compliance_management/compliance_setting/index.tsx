import React, { useState, useEffect } from 'react';
import { Box, Button, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { api } from '../../../services/api';
import AnnualComplianceDetailView from './AnnualComplianceDetailView';

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 1 - i);
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface Quarter {
    quarter: string;
    start: string;
    end: string;
}
interface ComplianceSetting {
    id: string;
    year: number;
    firstMonth: string;
    quarters: Quarter[];
}

const initialQuarters = (year: number): Quarter[] => [
    { quarter: 'Q1', start: `${year}-01-01`, end: `${year}-03-31` },
    { quarter: 'Q2', start: `${year}-04-01`, end: `${year}-06-30` },
    { quarter: 'Q3', start: `${year}-07-01`, end: `${year}-09-30` },
    { quarter: 'Q4', start: `${year}-10-01`, end: `${year}-12-31` },
];

const ComplianceSettingPage: React.FC = () => {
    const [settings, setSettings] = useState<ComplianceSetting[]>([]);
    const [viewId, setViewId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newYear, setNewYear] = useState<number>(years[0]);
    const [newMonth, setNewMonth] = useState<string>(months[0]);
    const [editSetting, setEditSetting] = useState<ComplianceSetting | null>(null);
    const [quarterModalOpen, setQuarterModalOpen] = useState(false);
    const [editQuarter, setEditQuarter] = useState<Quarter | null>(null);
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');

    useEffect(() => {
        api.get('/compliance-settings').then(res => {
            setSettings((res.data.data || []).map((s: any) => ({
                id: s._id,
                year: s.year,
                firstMonth: s.firstMonth,
                quarters: s.quarters,
            })));
        });
    }, []);

    const handleAddOrEdit = async () => {
        if (editSetting) {
            // Update
            try {
                const res = await api.put(`/compliance-settings/${editSetting.id}`, {
                    year: newYear,
                    firstMonth: newMonth,
                    quarters: editSetting.quarters,
                });
                setSettings(prev => prev.map(s =>
                    s.id === editSetting.id ? {
                        id: res.data.data._id,
                        year: res.data.data.year,
                        firstMonth: res.data.data.firstMonth,
                        quarters: res.data.data.quarters,
                    } : s
                ));
                setEditSetting(null);
            } catch (error) {
                console.error('Error updating compliance setting:', error);
                // Optionally show an error message to the user
            }
        } else {
            // Create
            try {
                const res = await api.post('/compliance-settings', {
                    year: newYear,
                    firstMonth: newMonth,
                    quarters: initialQuarters(newYear),
                });
                setSettings(prev => [
                    {
                        id: res.data.data._id,
                        year: res.data.data.year,
                        firstMonth: res.data.data.firstMonth,
                        quarters: res.data.data.quarters,
                    },
                    ...prev,
                ]);
            } catch (error) {
                console.error('Error creating compliance setting:', error);
                // Optionally show an error message to the user
            }
        }
        setModalOpen(false);
    };

    const handleOpenAdd = () => {
        setEditSetting(null);
        setNewYear(years[0]);
        setNewMonth(months[0]);
        setModalOpen(true);
    };

    const handleOpenEdit = (row: ComplianceSetting) => {
        setEditSetting(row);
        setNewYear(row.year);
        setNewMonth(row.firstMonth);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/compliance-settings/${id}`);
            setSettings(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting compliance setting:', error);
            // Optionally show an error message to the user
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditSetting(null);
    };

    // Quarter modal handlers
    const handleEditQuarter = (q: Quarter) => {
        setEditQuarter(q);
        setEditStart(q.start);
        setEditEnd(q.end);
        setQuarterModalOpen(true);
    };
    const handleSaveQuarter = async (quarter: Quarter, start: string, end: string) => {
        if (!viewId) return;
        const setting = settings.find(s => s.id === viewId);
        if (!setting) return;
        const updatedQuarters = setting.quarters.map(q =>
            q.quarter === quarter.quarter ? { ...q, start, end } : q
        );
        try {
            const res = await api.put(`/compliance-settings/${setting.id}`, {
                year: setting.year,
                firstMonth: setting.firstMonth,
                quarters: updatedQuarters,
            });
            setSettings(prev => prev.map(s =>
                s.id === setting.id ? {
                    id: res.data.data._id,
                    year: res.data.data.year,
                    firstMonth: res.data.data.firstMonth,
                    quarters: res.data.data.quarters,
                } : s
            ));
        } catch (error) {
            console.error('Error updating quarter dates:', error);
            // Optionally show an error message to the user
        }
    };
    const handleCancelQuarter = () => {
        setQuarterModalOpen(false);
        setEditQuarter(null);
    };

    // State and handlers for detail view using viewId
    const handleViewDetail = (id: string) => {
        setViewId(id);
    };

    const handleBackFromDetail = () => {
        setViewId(null);
        // Reset quarter modal state as well when going back from detail view
        setEditQuarter(null);
        setQuarterModalOpen(false);
    };

    const selectedSetting = settings.find(s => s.id === viewId);
    const quarters = selectedSetting?.quarters || [];

    if (viewId && selectedSetting) {
        return (
            <AnnualComplianceDetailView
                quarters={quarters}
                onBack={handleBackFromDetail}
                onEditQuarter={handleSaveQuarter}
            />
        );
    }

    return (
        <Box>
            {!viewId && (
                <>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleOpenAdd}
                            sx={{ textTransform: 'none', backgroundColor: '#0078D4', '&:hover': { backgroundColor: '#106EBE' } }}
                        >
                            + Add Annual Compliance Setting
                        </Button>
                    </Box>
                    <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                        <DialogTitle>{editSetting ? 'Edit Annual Compliance Setting' : 'Add Annual Compliance Setting'}</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={newYear}
                                    label="Year"
                                    onChange={e => setNewYear(Number(e.target.value))}
                                >
                                    {years.map(y => (
                                        <MenuItem key={y} value={y}>{y}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Financial Year 1st Month</InputLabel>
                                <Select
                                    value={newMonth}
                                    label="Financial Year 1st Month"
                                    onChange={e => setNewMonth(e.target.value)}
                                >
                                    {months.map(m => (
                                        <MenuItem key={m} value={m}>{m}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseModal}>Cancel</Button>
                            <Button onClick={handleAddOrEdit} variant="contained">Save</Button>
                        </DialogActions>
                    </Dialog>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: '1px solid #E5E7EB', overflowX: 'auto', mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Year</TableCell>
                                    <TableCell align='center'>Financial Year 1st Month</TableCell>
                                    <TableCell align='center'>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...settings]
                                    .sort((a, b) => b.year - a.year)
                                    .map(row => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.year}</TableCell>
                                            <TableCell align='center'>{row.firstMonth}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <Button variant="outlined" onClick={() => setViewId(row.id)}>
                                                        VIEW
                                                    </Button>
                                                    <Button variant="outlined" onClick={() => handleOpenEdit(row)}>
                                                        EDIT
                                                    </Button>
                                                    <Button variant="outlined" color="error" onClick={() => handleDelete(row.id)}>
                                                        DELETE
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
};

export default ComplianceSettingPage;
