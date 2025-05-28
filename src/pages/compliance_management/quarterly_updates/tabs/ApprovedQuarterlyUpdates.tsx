import React, { useState, useEffect } from 'react';
import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, Button, IconButton } from '@mui/material';
import moment from 'moment';
import { api } from '../../../../services/api';
import ArticleIcon from '@mui/icons-material/Article'; // Icon for comments/attachments
import CommentsAttachmentsViewModal from '../components/CommentsAttachmentsViewModal'; // Import the view modal
import { riskColors } from '../../obligation/obligationModal'; // Assuming riskColors is needed
import ApprovedObligationsDetail from '../components/ApprovedObligationsDetail'; // Import the new detail component

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
    complianceArea: { areaName: string; };
    frequency: string;
    lastDueDate: string;
    owner: { name: string; };
    riskLevel: string;
    status: string;
    tenantId: string;
    complianceStatus?: 'Completed' | 'Not Completed';
    update?: UpdateEntry[];
}

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

const ApprovedQuarterlyUpdates: React.FC = () => {
    const [currentQuarter, setCurrentQuarter] = useState<Quarter | null>(null);
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetail, setShowDetail] = useState(false); // State to control showing detail view

    useEffect(() => {
        const fetchComplianceSettings = async () => {
            try {
                // Fetch Compliance Settings to determine current quarter
                const settingsRes = await api.get('/compliance-settings');
                const settings: ComplianceSetting[] = (settingsRes.data.data || []).map((s: any) => ({
                    id: s._id,
                    year: s.year,
                    firstMonth: s.firstMonth,
                    quarters: s.quarters,
                }));

                const today = moment().startOf('day');
                settings.sort((a, b) => b.year - a.year);

                let foundQuarter: Quarter | null = null;
                let foundYear: number | null = null;

                for (const setting of settings) {
                    for (const quarter of setting.quarters) {
                        const quarterStart = moment(quarter.start).startOf('day');
                        const quarterEnd = moment(quarter.end).startOf('day');

                        if (today.isBetween(quarterStart, quarterEnd, null, '[]')) {
                            foundQuarter = quarter;
                            foundYear = setting.year;
                            break;
                        }
                    }
                    if(foundQuarter) break;
                }

                setCurrentQuarter(foundQuarter);
                setCurrentYear(foundYear);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching compliance settings:', err);
                setError('Failed to load compliance settings.');
                setLoading(false);
            }
        };

        fetchComplianceSettings();
    }, []); // Dependency array includes nothing, so it runs once on mount

     const handleViewClick = () => {
         setShowDetail(true);
     };

     const handleBackClick = () => {
         setShowDetail(false);
     };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    // If showDetail is true and we have a quarter and year, render the detail component
    if (showDetail && currentQuarter && currentYear) {
        return <ApprovedObligationsDetail year={currentYear} quarter={currentQuarter.quarter} onBack={handleBackClick} />;
    }

    // Otherwise, render the initial view with the table showing the quarter and view button
    return (
        <Box sx={{ mt: 2 }}>
             <Typography variant="h6" gutterBottom>Approved Quarterly Compliance Updates</Typography>

            {!currentQuarter ? (
                <Typography>No active compliance quarter found for today's date.</Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: '1px solid #E5E7EB', overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Year</TableCell>
                                <TableCell align='center'>Quarter</TableCell>
                                <TableCell align='center'>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{currentYear}</TableCell>
                                <TableCell align='center'>{currentQuarter.quarter}</TableCell>
                                <TableCell align='center'>
                                    <Button variant="outlined" onClick={handleViewClick}>
                                        VIEW
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

        </Box>
    );
};

export default ApprovedQuarterlyUpdates;
