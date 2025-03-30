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
  Stack,
  IconButton,
} from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';
import { QuarterType, AnnualTargetObjective } from '../../../types/annualCorporateScorecard';
import QuarterlyObjectiveModal from './QuarterlyObjectiveModal';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateAnnualTarget } from '../../../store/slices/scorecardSlice';

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
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<AnnualTargetObjective | null>(null);

  const annualTargets = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets
  );

  const selectedAnnualTarget = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );

  const dispatch = useAppDispatch();

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    setShowTable(false);
  };

  const handleQuarterChange = (event: SelectChangeEvent) => {
    setSelectedQuarter(event.target.value);
    setShowTable(false);
  };

  const handleView = () => {
    if (selectedAnnualTarget) {
      if (selectedAnnualTarget.content.totalWeight >= 100) {
        dispatch(updateAnnualTarget({
          ...selectedAnnualTarget,
          content: {
            ...selectedAnnualTarget.content,
            quarterlyTarget: {
              ...selectedAnnualTarget.content.quarterlyTarget,
              editable: true,
            }
          }
        }));
      }
    }
    setShowTable(true);
  };

  const getQuarterlyObjectives = () => {
    if (!selectedAnnualTarget || !selectedQuarter) return [];
    const quarterData = selectedAnnualTarget.content.quarterlyTarget.quarterlyTargets
      .find(q => q.quarter === selectedQuarter);
    return quarterData?.objectives || [];
  };

  const handleEdit = (objective: AnnualTargetObjective) => {
    setEditingObjective(objective);
    setIsModalOpen(true);
  };

  const handleDelete = (objectiveName: string) => {
    if (selectedAnnualTarget && selectedQuarter) {
      const updatedQuarterlyTargets = selectedAnnualTarget.content.quarterlyTarget.quarterlyTargets.map(qt => {
        if (qt.quarter === selectedQuarter) {
          return {
            ...qt,
            objectives: qt.objectives.filter(obj => obj.name !== objectiveName)
          };
        }
        return qt;
      });

      dispatch(updateAnnualTarget({
        ...selectedAnnualTarget,
        content: {
          ...selectedAnnualTarget.content,
          quarterlyTarget: {
            ...selectedAnnualTarget.content.quarterlyTarget,
            quarterlyTargets: updatedQuarterlyTargets
          }
        }
      }));
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StyledFormControl fullWidth>
          <InputLabel>Annual Corporate Scorecard</InputLabel>
          <Select
            value={selectedAnnualTargetId}
            label="Annual Corporate Scorecard"
            onChange={handleScorecardChange}
          >
            {annualTargets.map((target) => (
              <MenuItem key={target._id} value={target._id}>
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
            {selectedAnnualTarget?.content.quarterlyTarget.quarterlyTargets.map((quarter) => (
              <MenuItem key={quarter.quarter} value={quarter.quarter}>
                {quarter.quarter}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <ViewButton
          variant="contained"
          disabled={!selectedAnnualTargetId || !selectedQuarter}
          onClick={handleView}
        >
          View
        </ViewButton>
      </Box>

      {showTable && selectedAnnualTarget && (
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
                  <StyledTableCell>{selectedAnnualTarget.name}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.startDate}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.endDate}</StyledTableCell>
                  <StyledTableCell>{selectedAnnualTarget.status}</StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          <Stack spacing={2}>
            {selectedAnnualTarget.content.quarterlyTarget.editable && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setIsModalOpen(true)}
                sx={{
                  alignSelf: 'flex-start',
                  p: 2,
                  border: '1px dashed #E5E7EB',
                  borderRadius: '8px',
                  width: '100%',
                  '&:hover': {
                    backgroundColor: '#F9FAFB',
                    borderColor: '#6264A7',
                    color: '#6264A7',
                  },
                }}
              >
                Add new
              </Button>
            )}

            <Paper sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}>
              <Table size="small">
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
                  {getQuarterlyObjectives().map((objective) => (
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
                        {kpiIndex === 0 && (
                          <StyledTableCell align="right" rowSpan={objective.KPIs.length}>
                            {selectedAnnualTarget.content.quarterlyTarget.editable && (
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#6B7280' }}
                                  onClick={() => handleEdit(objective)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  sx={{ color: '#6B7280' }}
                                  onClick={() => handleDelete(objective.name)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            )}
                          </StyledTableCell>
                        )}
                      </TableRow>
                    ))
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Stack>

          <QuarterlyObjectiveModal
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingObjective(null);
            }}
            annualTarget={selectedAnnualTarget}
            quarter={selectedQuarter as QuarterType}
            editingObjective={editingObjective}
          />
        </Box>
      )}
    </Box>
  );
};

export default QuarterlyTargetTable;
