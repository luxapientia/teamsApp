import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Stack,
  IconButton,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { updateAnnualTarget } from '../../../store/slices/scorecardSlice';
import { RootState } from '../../../store';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { AnnualTargetObjective, AnnualTargetKPI } from '../../../types/annualCorporateScorecard';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface AddStrategicObjectiveModalProps {
  open: boolean;
  onClose: () => void;
  targetName: string;
  editingObjective?: AnnualTargetObjective | null;
}

const defaultRatingScores = [
  { name: 'Unacceptable', min: 0, max: 49 },
  { name: 'Room for Improvement', min: 50, max: 89 },
  { name: 'Target Achieved', min: 90, max: 100 },
  { name: 'High Achiever', min: 101, max: 110 },
  { name: 'Superior Performance', min: 111, max: 140 },
];

const AddStrategicObjectiveModal: React.FC<AddStrategicObjectiveModalProps> = ({
  open,
  onClose,
  targetName,
  editingObjective
}) => {
  const dispatch = useAppDispatch();
  const annualTarget = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target.name === targetName)
  );
  const perspectives = annualTarget?.content.perspectives || [];
  const [perspective, setPerspective] = useState('');
  const [objective, setObjective] = useState('');
  const [kpis, setKpis] = useState<AnnualTargetKPI[]>([{
    indicator: '',
    weight: 0,
    baseline: 0,
    target: 0,
    ratingScores: defaultRatingScores
  }]);
  const [expandedKPI, setExpandedKPI] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    perspective?: string;
    objective?: string;
    kpis?: {
      indicator?: string;
      weight?: string;
      baseline?: string;
      target?: string;
    }[];
    general?: string;
  }>({});

  useEffect(() => {
    if (editingObjective) {
      setPerspective(editingObjective.perspective);
      setObjective(editingObjective.name);
      setKpis(editingObjective.KPIs);
    }
  }, [editingObjective]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Validate perspective
    if (!perspective) {
      newErrors.perspective = 'Perspective is required';
      isValid = false;
    }

    // Validate objective
    if (!objective) {
      newErrors.objective = 'Strategic objective is required';
      isValid = false;
    }

    // Validate KPIs
    const kpiErrors = kpis.map(kpi => {
      const errors: { [key: string]: string } = {};
      
      if (!kpi.indicator.trim()) {
        errors.indicator = 'KPI is required';
        isValid = false;
      }

      if (!kpi.weight) {
        errors.weight = 'Weight is required';
        isValid = false;
      } else if (kpi.weight < 0 || kpi.weight > 100) {
        errors.weight = 'Weight must be between 0 and 100';
        isValid = false;
      }

      if (kpi.baseline === null || kpi.baseline === undefined) {
        errors.baseline = 'Baseline is required';
        isValid = false;
      }

      if (kpi.target === null || kpi.target === undefined) {
        errors.target = 'Target is required';
        isValid = false;
      }

      return errors;
    });

    // Validate total weight equals 100
    const totalWeight = kpis.reduce((sum, kpi) => sum + (kpi.weight || 0), 0);
    if (totalWeight !== 100) {
      newErrors.general = 'Total weight must equal 100%';
      isValid = false;
    }

    if (kpiErrors.some(error => Object.keys(error).length > 0)) {
      newErrors.kpis = kpiErrors;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && annualTarget) {
      const newObjective: AnnualTargetObjective = {
        perspective,
        name: objective,
        KPIs: kpis,
      };

      const updatedObjectives = editingObjective
        ? annualTarget.content.objectives.map(obj => 
            obj.name === editingObjective.name ? newObjective : obj
          )
        : [...annualTarget.content.objectives, newObjective];

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          objectives: updatedObjectives,
        },
      }));
      handleClose();
    }
  };

  const handleClose = () => {
    setPerspective('');
    setObjective('');
    setKpis([{ indicator: '', weight: 0, baseline: 0, target: 0, ratingScores: defaultRatingScores }]);
    onClose();
  };

  const handleAddKPI = () => {
    setKpis([...kpis, {
      indicator: '',
      weight: 0,
      baseline: 0,
      target: 0,
      ratingScores: defaultRatingScores
    }]);
  };

  const handleToggleRatingScore = (index: number) => {
    setExpandedKPI(expandedKPI === index ? null : index);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '8px' }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add Strategic Objective
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {errors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.general}
                </Alert>
              )}

              <FormControl fullWidth error={!!errors.perspective}>
                <InputLabel>Perspective</InputLabel>
                <Select
                  value={perspective}
                  label="Perspective"
                  onChange={(e) => setPerspective(e.target.value)}
                  sx={{ backgroundColor: '#F9FAFB' }}
                >
                  {perspectives.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
                {errors.perspective && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {errors.perspective}
                  </Typography>
                )}
              </FormControl>

              <TextField
                label="Strategic Objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                fullWidth
                error={!!errors.objective}
                helperText={errors.objective}
                sx={{ backgroundColor: '#F9FAFB' }}
              />

              {/* KPI Section */}
              <Box>
                <Button
                  variant="contained"
                  onClick={handleAddKPI}
                  startIcon={<AddIcon />}
                  sx={{
                    mb: 2,
                    backgroundColor: '#6264A7',
                    '&:hover': { backgroundColor: '#4F46E5' },
                  }}
                >
                  Add KPI
                </Button>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '40px' }} /> {/* For expand button */}
                      <TableCell>Key Performance Indicator</TableCell>
                      <TableCell align="right">Weight %</TableCell>
                      <TableCell align="right">Baseline</TableCell>
                      <TableCell align="right">Target</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kpis.map((kpi, index) => (
                      <React.Fragment key={index}>
                        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleRatingScore(index)}
                            >
                              {expandedKPI === index ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={kpi.indicator}
                              onChange={(e) => {
                                const newKpis = [...kpis];
                                newKpis[index].indicator = e.target.value;
                                setKpis(newKpis);
                              }}
                              variant="standard"
                              error={!!errors.kpis?.[index]?.indicator}
                              helperText={errors.kpis?.[index]?.indicator}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={kpi.weight}
                              onChange={(e) => {
                                const newKpis = [...kpis];
                                newKpis[index].weight = Number(e.target.value);
                                setKpis(newKpis);
                              }}
                              variant="standard"
                              error={!!errors.kpis?.[index]?.weight}
                              helperText={errors.kpis?.[index]?.weight}
                              sx={{ width: '80px' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={kpi.baseline}
                              onChange={(e) => {
                                const newKpis = [...kpis];
                                newKpis[index].baseline = Number(e.target.value);
                                setKpis(newKpis);
                              }}
                              variant="standard"
                              error={!!errors.kpis?.[index]?.baseline}
                              helperText={errors.kpis?.[index]?.baseline}
                              sx={{ width: '80px' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={kpi.target}
                              onChange={(e) => {
                                const newKpis = [...kpis];
                                newKpis[index].target = Number(e.target.value);
                                setKpis(newKpis);
                              }}
                              variant="standard"
                              error={!!errors.kpis?.[index]?.target}
                              helperText={errors.kpis?.[index]?.target}
                              sx={{ width: '80px' }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={expandedKPI === index} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                  Performance Rating Score
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell width="40px">No</TableCell>
                                      <TableCell>Rating</TableCell>
                                      <TableCell align="right">Min</TableCell>
                                      <TableCell align="right">Max</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {defaultRatingScores.map((score, scoreIndex) => (
                                      <TableRow key={scoreIndex}>
                                        <TableCell>{scoreIndex + 1}</TableCell>
                                        <TableCell>{score.name}</TableCell>
                                        <TableCell align="right">
                                          <TextField
                                            type="number"
                                            value={score.min}
                                            variant="standard"
                                            sx={{ width: '80px' }}
                                          />
                                        </TableCell>
                                        <TableCell align="right">
                                          <TextField
                                            type="number"
                                            value={score.max}
                                            variant="standard"
                                            sx={{ width: '80px' }}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              {/* Save Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    backgroundColor: '#6264A7',
                    '&:hover': { backgroundColor: '#4F46E5' },
                  }}
                >
                  Save
                </Button>
              </Box>
            </Stack>
          </form>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddStrategicObjectiveModal; 