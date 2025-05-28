import React, { useState, useEffect } from 'react';
import { Box, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, Button } from '@mui/material';
import moment from 'moment';
import { api } from '../../../../services/api';
import QuarterObligationsDetail from '../components/QuarterObligationsDetail';

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

const CurrentQuarterUpdates: React.FC = () => {
    const [currentQuarter, setCurrentQuarter] = useState<Quarter | null>(null);
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        const fetchComplianceSettings = async () => {
            try {
                const res = await api.get('/compliance-settings');
                const settings: ComplianceSetting[] = (res.data.data || []).map((s: any) => ({
                    id: s._id,
                    year: s.year,
                    firstMonth: s.firstMonth,
                    quarters: s.quarters,
                }));

                const today = moment().startOf('day'); // Get start of today
                
                // Sort settings by year descending - still useful if multiple years have overlapping quarters, though not ideal data structure
                settings.sort((a, b) => b.year - a.year);

                let foundQuarter: Quarter | null = null;
                let foundYear: number | null = null;

                // Find the current quarter based on today's date within the quarter's start and end dates
                for (const setting of settings) {
                    for (const quarter of setting.quarters) {
                        const quarterStart = moment(quarter.start).startOf('day'); // Get start of quarter start date
                        const quarterEnd = moment(quarter.end).startOf('day'); // Get start of quarter end date
                        
                        // Check if today is between or the same as the quarter's start and end dates (inclusive)
                        if (today.isBetween(quarterStart, quarterEnd, null, '[]')) {
                            foundQuarter = quarter;
                            foundYear = setting.year;
                            break; // Found the quarter, no need to check others for this setting
                        }
                    }
                    if(foundQuarter) break; // Found the quarter, no need to check other settings
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
    }, []);
    
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

    if (showDetail && currentQuarter && currentYear) {
        return <QuarterObligationsDetail year={currentYear} quarter={currentQuarter.quarter} onBack={handleBackClick} />;
    }

    return (
        <Box sx={{ mt: 2 }}>
             <Typography variant="h6" gutterBottom>Current Quarterly Compliance Update</Typography>
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

export default CurrentQuarterUpdates; 