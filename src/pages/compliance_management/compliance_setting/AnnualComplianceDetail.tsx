import React from 'react';
import { Box, Button, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const quarters = [
  { quarter: 'Q1', start: '2025-01-01', end: '2025-06-06' },
  { quarter: 'Q2', start: '2025-04-01', end: '2025-06-30' },
  { quarter: 'Q3', start: '2025-07-01', end: '2025-09-30' },
  { quarter: 'Q4', start: '2025-10-01', end: '2025-12-31' },
];

const AnnualComplianceDetail: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate(-1)}>Back</Button>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: '1px solid #E5E7EB', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quarter</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quarters.map(q => (
              <TableRow key={q.quarter} hover>
                <TableCell>{q.quarter}</TableCell>
                <TableCell>{q.start}</TableCell>
                <TableCell>{q.end}</TableCell>
                <TableCell>
                  <IconButton color="primary" size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AnnualComplianceDetail; 