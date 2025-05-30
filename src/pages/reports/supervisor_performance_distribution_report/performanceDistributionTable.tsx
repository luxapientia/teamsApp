import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, Paper, TableBody } from '@mui/material';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { AnnualTarget } from '../../../types';

interface PerformanceDistributionTableProps {
    title: string;
    annualTarget: AnnualTarget;
    chartData: {
      rating: number;
      count: number;
    }[];
}

const PerformanceDistributionTable: React.FC<PerformanceDistributionTableProps> = ({ title, annualTarget, chartData }) => {
    return (
        <Box sx={{ py: 2 }}>
            <Paper sx={{ flex: 1, boxShadow: 'none', border: '1px solid #E5E7EB', overflowX: 'auto' }}>
                <Typography variant="h6" sx={{ p: 2 }}>{title}</Typography>
                <Table size="small" id="performance-distribution-table">
                    <TableHead>
                        <TableRow>
                            <StyledHeaderCell align="center" sx={{ width: '15%' }}>Performance Rating Score</StyledHeaderCell>
                            <StyledHeaderCell align="center" sx={{ width: '35%' }}>Description</StyledHeaderCell>
                            <StyledHeaderCell align="center" sx={{ width: '25%' }}>No of Employees</StyledHeaderCell>
                            <StyledHeaderCell align="center" sx={{ width: '25%' }}>%</StyledHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {annualTarget.content.ratingScales.map((ratingScale) => (
                            <TableRow key={ratingScale.score}>
                                <StyledTableCell align="center" sx={{ width: '15%' }}>{ratingScale.score}</StyledTableCell>
                                <StyledTableCell align="center" sx={{ width: '35%' }}>{ratingScale.name}</StyledTableCell>
                                <StyledTableCell align="center" sx={{ width: '25%' }}>{chartData.find(data => data.rating === ratingScale.score)?.count}</StyledTableCell>
                                <StyledTableCell align="center" sx={{ width: '25%' }}>{((chartData.find(data => data.rating === ratingScale.score)?.count / (chartData.reduce((prev, current) => prev + current.count, 0) || 1)) * 100).toFixed(2)}</StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default PerformanceDistributionTable;

