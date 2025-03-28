import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  styled,
  SelectChangeEvent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { RootState } from '../../../store';

const StyledFormControl = styled(FormControl)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: '#D1D5DB',
    },
  },
});

const ViewButton = styled(Button)({
  backgroundColor: '#0078D4',
  color: 'white',
  textTransform: 'none',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: '#106EBE',
  },
});

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

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

const QuarterlyTargetTable: React.FC = () => {
  const [selectedScorecard, setSelectedScorecard] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [showTable, setShowTable] = useState(false);
  
  const annualTargets = useAppSelector((state: RootState) => 
    state.scorecard.annualTargets
  );

  const selectedTarget = annualTargets.find(target => target.id === selectedScorecard);

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedScorecard(event.target.value);
    setShowTable(false);
  };

  const handleQuarterChange = (event: SelectChangeEvent) => {
    setSelectedQuarter(event.target.value);
    setShowTable(false);
  };

  const handleView = () => {
    setShowTable(true);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StyledFormControl fullWidth>
          <InputLabel>Annual Corporate Scorecard</InputLabel>
          <Select
            value={selectedScorecard}
            label="Annual Corporate Scorecard"
            onChange={handleScorecardChange}
          >
            {annualTargets.map((target) => (
              <MenuItem key={target.id} value={target.id}>
                {target.name}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <StyledFormControl sx={{ minWidth: 200 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            value={selectedQuarter}
            label="Quarter"
            onChange={handleQuarterChange}
          >
            {quarters.map((quarter) => (
              <MenuItem key={quarter} value={quarter}>
                {quarter}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <ViewButton
          variant="contained"
          disabled={!selectedScorecard || !selectedQuarter}
          onClick={handleView}
        >
          View
        </ViewButton>
      </Box>

      {showTable && selectedTarget && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quarterly Corporate Scorecard - {selectedQuarter}
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledHeaderCell>Annual Corporate Scorecard</StyledHeaderCell>
                  <StyledHeaderCell>Start Date</StyledHeaderCell>
                  <StyledHeaderCell>End Date</StyledHeaderCell>
                  <StyledHeaderCell>Status</StyledHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>{selectedTarget.name}</StyledTableCell>
                  <StyledTableCell>{selectedTarget.startDate}</StyledTableCell>
                  <StyledTableCell>{selectedTarget.endDate}</StyledTableCell>
                  <StyledTableCell>{selectedTarget.status}</StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledHeaderCell>Perspective</StyledHeaderCell>
                  <StyledHeaderCell>Strategic Objective</StyledHeaderCell>
                  <StyledHeaderCell align="right">Weight %</StyledHeaderCell>
                  <StyledHeaderCell>Key Performance Indicator</StyledHeaderCell>
                  <StyledHeaderCell align="right">Baseline</StyledHeaderCell>
                  <StyledHeaderCell align="right">Target</StyledHeaderCell>
                  <StyledHeaderCell align="right">Rating Score</StyledHeaderCell>
                  <StyledHeaderCell align="right">Actions</StyledHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedTarget.content.objectives.map((objective) => (
                  objective.KPIs.map((kpi, kpiIndex) => (
                    <TableRow key={`${objective.name}-${kpiIndex}`}>
                      {kpiIndex === 0 && (
                        <>
                          <StyledTableCell rowSpan={objective.KPIs.length}>
                            {objective.perspective}
                          </StyledTableCell>
                          <StyledTableCell rowSpan={objective.KPIs.length}>
                            {objective.name}
                          </StyledTableCell>
                        </>
                      )}
                      <StyledTableCell align="right">{kpi.weight}</StyledTableCell>
                      <StyledTableCell>{kpi.indicator}</StyledTableCell>
                      <StyledTableCell align="right">{kpi.baseline}</StyledTableCell>
                      <StyledTableCell align="right">{kpi.target}</StyledTableCell>
                      <StyledTableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: '#E5E7EB',
                            color: '#374151',
                            '&:hover': {
                              borderColor: '#D1D5DB',
                              backgroundColor: '#F9FAFB',
                            },
                          }}
                        >
                          View
                        </Button>
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {/* Add actions here */}
                      </StyledTableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default QuarterlyTargetTable;
