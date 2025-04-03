import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AnnualTarget, AnnualTargetPerspective } from '../../../types/annualCorporateScorecard';
import AddIcon from '@mui/icons-material/Add';
interface AddInitiativeModalProps {
  open: boolean;
  onClose: () => void;
  annualTarget: AnnualTarget;
}

const AddInitiativeModal: React.FC<AddInitiativeModalProps> = ({
  open,
  onClose,
  annualTarget,
}) => {
  const [selectedPerspective, setSelectedPerspective] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  const [kpis, setKpis] = useState([{
    indicator: '',
    weight: '',
    baseline: '',
    target: '',
  }]);

  const handlePerspectiveChange = (event: SelectChangeEvent) => {
    setSelectedPerspective(event.target.value);
    setSelectedObjective('');
  };

  const handleObjectiveChange = (event: SelectChangeEvent) => {
    setSelectedObjective(event.target.value);
  };

  const handleAddKPI = () => {
    setKpis([...kpis, { indicator: '', weight: '', baseline: '', target: '' }]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Add Initiative</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>Perspective</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedPerspective}
              onChange={handlePerspectiveChange}
              sx={{ bgcolor: '#F9FAFB' }}
            >
              {annualTarget.content.perspectives.map((perspective: AnnualTargetPerspective) => (
                <MenuItem key={perspective.index} value={perspective.index}>
                  {perspective.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>Strategic Objective</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedObjective}
              onChange={handleObjectiveChange}
              sx={{ bgcolor: '#F9FAFB' }}
            >
              {annualTarget.content.objectives
                .filter(obj => obj.perspectiveId === Number(selectedPerspective))
                .map((objective) => (
                  <MenuItem key={objective.name} value={objective.name}>
                    {objective.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>Initiative</Typography>
          <TextField
            fullWidth
            size="small"
            sx={{ bgcolor: '#F9FAFB' }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography>Key Performance Indicator</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddKPI}
              sx={{ ml: 2, color: '#6B7280' }}
            >
              Add KPI
            </Button>
          </Box>

          {kpis.map((kpi, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Key Performance Indicator"
                fullWidth
                size="small"
                sx={{ bgcolor: '#F9FAFB' }}
              />
              <TextField
                label="Weight %"
                size="small"
                sx={{ width: 100, bgcolor: '#F9FAFB' }}
              />
              <TextField
                label="Baseline"
                size="small"
                sx={{ width: 100, bgcolor: '#F9FAFB' }}
              />
              <TextField
                label="Target"
                size="small"
                sx={{ width: 100, bgcolor: '#F9FAFB' }}
              />
            </Box>
          ))}
        </Box>

        <Box>
          <Typography sx={{ mb: 2 }}>Set Performance Rating Score</Typography>
          {[
            { score: 1, name: 'Unacceptable', min: '0', max: '49' },
            { score: 2, name: 'Room for Improvement', min: '50', max: '89' },
            { score: 3, name: 'Target Achieved', min: '90', max: '100' },
            { score: 4, name: 'High Achiever', min: '101', max: '110' },
            { score: 5, name: 'Superior Performance', min: '111', max: '140' },
          ].map((rating) => (
            <Box key={rating.score} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <Typography sx={{ width: 20 }}>{rating.score}</Typography>
              <Typography sx={{ width: 200, color: '#6B7280' }}>{rating.name}</Typography>
              <TextField
                size="small"
                value={rating.min}
                sx={{ width: 100 }}
                InputProps={{ readOnly: true }}
              />
              <TextField
                size="small"
                value={rating.max}
                sx={{ width: 100 }}
                InputProps={{ readOnly: true }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#4F46E5' },
            }}
          >
            Save
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddInitiativeModal; 