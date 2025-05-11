import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
  IconButton,
  TextField,
  Button,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAppSelector } from '../../../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { RootState } from '../../../../../store';
import { updateAnnualTarget } from '../../../../../store/slices/scorecardSlice';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#374151',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#6B7280',
  fontWeight: 500,
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#0078D4',
    '&:hover': {
      backgroundColor: 'rgba(0, 120, 212, 0.04)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#0078D4',
  },
}));

interface AssessmentsPeriodTabProps {
  targetName: string;
}

type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

const AssessmentsPeriodTab: React.FC<AssessmentsPeriodTabProps> = ({ targetName }) => {
  const dispatch = useAppDispatch();
  const annualTarget = useAppSelector((state: RootState) => 
    state.scorecard.annualTargets.find(target => target.name === targetName)
  );

  const quarters: QuarterType[] = ['Q1', 'Q2', 'Q3', 'Q4'];

  const handleToggleEnabled = (quarter: QuarterType) => {
    if (annualTarget) {
      const updatedQuarterlyTargets = annualTarget.content.quarterlyTarget.quarterlyTargets.map(qt => {
        if (qt.quarter === quarter) {
          return {
            ...qt,
            editable: !qt.editable
          };
        }
        return qt;
      });
      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          quarterlyTarget: {
            ...annualTarget.content.quarterlyTarget,
            quarterlyTargets: updatedQuarterlyTargets
          }
        },
      }));
    }
  };

  const getQuarterEnabled = (quarter: QuarterType): boolean => {
    const quarterlyTarget = annualTarget?.content.quarterlyTarget.quarterlyTargets.find(
      qt => qt.quarter === quarter
    );
    return quarterlyTarget?.editable ?? false;
  };

  return (
    <Box p={2}>
      <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledHeaderCell>Quarter</StyledHeaderCell>
              <StyledHeaderCell>Enable</StyledHeaderCell>
              <StyledHeaderCell align="right">Action</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quarters.map((quarter) => {
              const isEnabled = getQuarterEnabled(quarter);
              return (
                <TableRow key={quarter}>
                  <StyledTableCell>
                    <Typography variant="body1">
                      {quarter}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="textSecondary">
                      {isEnabled ? 'Yes' : 'No'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <StyledSwitch
                      disabled={quarter === 'Q1'}
                      checked={isEnabled}
                      onChange={() => handleToggleEnabled(quarter)}
                      inputProps={{ 'aria-label': `Toggle ${quarter}` }}
                    />
                  </StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AssessmentsPeriodTab;
