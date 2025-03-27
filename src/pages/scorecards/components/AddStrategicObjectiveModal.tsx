import React, { useState } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { updateAnnualTarget } from '../../../store/slices/scorecardSlice';
import { RootState } from '../../../store';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { AnnualTargetObjective, AnnualTargetKPI } from '../../../types/annualCorporateScorecard';
import AddIcon from '@mui/icons-material/Add';

interface AddStrategicObjectiveModalProps {
  open: boolean;
  onClose: () => void;
  targetName: string;
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
    ratingScores: [
      {
        name: 'Unacceptable',
        max: 0,
        min: 50,
      },
      {
        name: 'Room for Improvement',
        max: 70,
        min: 50,
      },
      {
        name: 'Target Achieved',
        max: 85,
        min: 70,
      },
      {
        name: 'High Achiever',
        max: 100,
        min: 85,
      },
      {
        name: 'Superior Performance',
        max: 100,
        min: 95,
      },
    ],
  }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (annualTarget && perspective && objective) {
      const newObjective: AnnualTargetObjective = {
        perspective,
        name: objective,
        KPIs: kpis,
      };

      dispatch(updateAnnualTarget({
        ...annualTarget,
        content: {
          ...annualTarget.content,
          objectives: [...annualTarget.content.objectives, newObjective],
        },
      }));
      handleClose();
    }
  };

  const handleClose = () => {
    setPerspective('');
    setObjective('');
    setKpis([{ indicator: '', weight: 0, baseline: 0, target: 0, ratingScores: [] }]);
    onClose();
  };

  const handleAddKPI = () => {
    setKpis([...kpis, {
      indicator: '',
      weight: 0,
      baseline: 0,
      target: 0,
      ratingScores: [...defaultRatingScores]
    }]);
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
              <FormControl fullWidth>
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
              </FormControl>

              <TextField
                label="Strategic Objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                fullWidth
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

                {kpis.map((kpi, index) => (
                  <Stack key={index} spacing={3} sx={{ mb: 4, p: 2, border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    {/* KPI Fields */}
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Key Performance Indicator"
                        value={kpi.indicator}
                        onChange={(e) => {
                          const newKpis = [...kpis];
                          newKpis[index].indicator = e.target.value;
                          setKpis(newKpis);
                        }}
                        fullWidth
                        sx={{ backgroundColor: '#F9FAFB' }}
                      />
                      <TextField
                        label="Weight %"
                        type="number"
                        value={kpi.weight}
                        onChange={(e) => {
                          const newKpis = [...kpis];
                          newKpis[index].weight = Number(e.target.value);
                          setKpis(newKpis);
                        }}
                        sx={{ width: '100px', backgroundColor: '#F9FAFB' }}
                      />
                      <TextField
                        label="Baseline"
                        type="number"
                        value={kpi.baseline}
                        onChange={(e) => {
                          const newKpis = [...kpis];
                          newKpis[index].baseline = Number(e.target.value);
                          setKpis(newKpis);
                        }}
                        sx={{ width: '150px', backgroundColor: '#F9FAFB' }}
                      />
                      <TextField
                        label="Target"
                        type="number"
                        value={kpi.target}
                        onChange={(e) => {
                          const newKpis = [...kpis];
                          newKpis[index].target = Number(e.target.value);
                          setKpis(newKpis);
                        }}
                        sx={{ width: '150px', backgroundColor: '#F9FAFB' }}
                      />
                    </Stack>

                    {/* Performance Rating Score Table */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151' }}>
                        Set Performance Rating Score
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={2} sx={{ px: 2 }}>
                          <Box sx={{ width: '40px' }}></Box>
                          <Typography sx={{ flex: 1, color: '#6B7280' }}>Rating</Typography>
                          <Typography sx={{ width: '100px', color: '#6B7280' }}>Min</Typography>
                          <Typography sx={{ width: '100px', color: '#6B7280' }}>Max</Typography>
                        </Stack>
                        {kpi.ratingScores.map((score, scoreIndex) => (
                          <Stack 
                            key={scoreIndex} 
                            direction="row" 
                            spacing={2}
                            sx={{ 
                              p: 2,
                              backgroundColor: '#F9FAFB',
                              borderRadius: '4px'
                            }}
                          >
                            <Typography sx={{ width: '40px', color: '#374151' }}>
                              {scoreIndex + 1}
                            </Typography>
                            <Typography sx={{ flex: 1, color: '#374151' }}>
                              {score.name}
                            </Typography>
                            <TextField
                              size="small"
                              type="number"
                              value={score.min}
                              onChange={(e) => {
                                const newKpis = [...kpis];
                                newKpis[index].ratingScores[scoreIndex].min = Number(e.target.value);
                                setKpis(newKpis);
                              }}
                              sx={{ width: '100px' }}
                            />
                            <TextField
                              size="small"
                              type="number"
                              value={score.max}
                              onChange={(e) => {
                                const newKpis = [...kpis];
                                newKpis[index].ratingScores[scoreIndex].max = Number(e.target.value);
                                setKpis(newKpis);
                              }}
                              sx={{ width: '100px' }}
                            />
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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