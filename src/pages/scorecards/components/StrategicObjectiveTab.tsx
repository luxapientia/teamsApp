import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '12px 16px',
  color: '#374151',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '12px 16px',
  color: '#6B7280',
  fontWeight: 500,
}));

const StrategicObjectiveTab: React.FC = () => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledHeaderCell>Objective</StyledHeaderCell>
          <StyledHeaderCell>Weight</StyledHeaderCell>
          <StyledHeaderCell>Target</StyledHeaderCell>
          <StyledHeaderCell>Status</StyledHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* Add your strategic objective data here */}
      </TableBody>
    </Table>
  );
};

export default StrategicObjectiveTab; 