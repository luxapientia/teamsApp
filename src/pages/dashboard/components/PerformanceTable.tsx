import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { AnnualTarget } from '../../../types/annualCorporateScorecard';

interface PerformanceTableProps {
  tableData: {
    [key: number]: {
      count: number;
      percentage: number;
    }
  };
  selectedAnnualTarget: AnnualTarget;
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ tableData, selectedAnnualTarget }) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rating Score</TableCell>
            <TableCell>Rating Scale</TableCell>
            <TableCell align='center'>No. of Employees</TableCell>
            <TableCell align='center'>Percentage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedAnnualTarget.content.ratingScales.map(scale => {
            const data = tableData[scale.score] || { count: 0, percentage: 0 };
            return (
              <TableRow key={scale.score}>
                <TableCell>{scale.score}</TableCell>
                <TableCell>
                  <Typography sx={{ color: scale.color, fontWeight: 500 }}>
                    {scale.name} ({scale.min}-{scale.max})
                  </Typography>
                </TableCell>
                <TableCell align="center">{data.count}</TableCell>
                <TableCell align="center">{data.percentage}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PerformanceTable; 