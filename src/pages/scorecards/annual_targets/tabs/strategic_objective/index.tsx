import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  styled,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddStrategicObjectiveModal from './AddStrategicObjectiveModal';
import { useAppSelector } from '../../../../../hooks/useAppSelector';
import { RootState } from '../../../../../store';
import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { updateAnnualTarget } from '../../../../../store/slices/scorecardSlice';

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

interface StrategicObjectiveTabProps {
  targetName: string;
}

const StrategicObjectiveTab: React.FC<StrategicObjectiveTabProps> = ({ targetName }) => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<{
    perspective: string;
    name: string;
    KPIs: any[];
  } | null>(null);

  const annualTarget = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target.name === targetName)
  );

  const objectives = annualTarget?.content.objectives || [];

  const handleEdit = (objective: any) => {
    setEditingObjective(objective);
    setIsModalOpen(true);
  };

  const handleDelete = (objectiveName: string) => {
    if (annualTarget) {
      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          objectives: annualTarget.content.objectives.filter(obj => obj.name !== objectiveName)
        }
      }));
    }
  };

  return (
    <Box p={2}>
      <Stack spacing={2}>
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
            {objectives.map((objective) => (
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
                    </StyledTableCell>
                  )}
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>

        <Button
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{
            color: '#6B7280',
            justifyContent: 'flex-start',
            textTransform: 'none',
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
      </Stack>

      <AddStrategicObjectiveModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingObjective(null);
        }}
        targetName={targetName}
        editingObjective={editingObjective}
      />
    </Box>
  );
};

export default StrategicObjectiveTab; 