import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Select, InputLabel, FormControl, Box
} from '@mui/material';

interface ComplianceArea {
  _id: string;
  areaName: string;
}

interface Team {
  _id: string;
  name: string;
}

interface ObligationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  complianceAreas: ComplianceArea[];
  teams: Team[];
  initialData?: any;
}

const frequencies = [
  'Daily', 'Monthly', 'Quarterly', 'Bi-Annual', 'Annual',
  'Every 2 Years', 'Every 3 Years', 'Every 4 Years', 'Every 5 Years',
  'Every 6 Years', 'Every 7 Years', 'Every 8 Years', 'Every 9 Years', 'Every 10 Years'
];

export const riskColors: Record<string, string> = {
  High: '#FF4D4F',    // Red
  Medium: '#FFC53D',  // Amber
  Low: '#52C41A'      // Green
};

const ObligationModal: React.FC<ObligationModalProps> = ({ open, onClose, onSave, complianceAreas, teams, initialData }) => {
  const [complianceObligation, setComplianceObligation] = useState('');
  const [complianceArea, setComplianceArea] = useState('');
  const [frequency, setFrequency] = useState('');
  const [lastDueDate, setLastDueDate] = useState('');
  const [owner, setOwner] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (open) {
      setComplianceObligation(initialData?.complianceObligation || '');
      setComplianceArea(
        typeof initialData?.complianceArea === 'object'
          ? initialData.complianceArea._id
          : initialData?.complianceArea || ''
      );
      setFrequency(initialData?.frequency || '');
      setLastDueDate(initialData?.lastDueDate || '');
      setOwner(
        typeof initialData?.owner === 'object'
          ? initialData.owner._id
          : initialData?.owner || ''
      );
      setRiskLevel(initialData?.riskLevel || '');
      setStatus(initialData?.status || 'Active');
    }
  }, [open, initialData]);

  const handleSave = () => {
    onSave({
      complianceObligation,
      complianceArea,
      frequency,
      lastDueDate,
      owner,
      riskLevel,
      status
    });
  };

  const isValid =
    complianceObligation.trim() &&
    complianceArea &&
    frequency &&
    lastDueDate &&
    owner &&
    riskLevel &&
    status;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Compliance Obligation' : 'Add Compliance Obligation'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Compliance Obligation"
          value={complianceObligation}
          onChange={e => setComplianceObligation(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Compliance Area</InputLabel>
          <Select
            value={complianceArea}
            onChange={e => setComplianceArea(e.target.value)}
            label="Compliance Area"
          >
            {complianceAreas.map(area => (
              <MenuItem key={area._id} value={area._id}>{area.areaName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Frequency</InputLabel>
          <Select
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            label="Frequency"
          >
            {frequencies.map(f => (
              <MenuItem key={f} value={f}>{f}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Last Due Date"
          type="date"
          value={lastDueDate}
          onChange={e => setLastDueDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Owner</InputLabel>
          <Select
            value={owner}
            onChange={e => setOwner(e.target.value)}
            label="Owner"
          >
            {teams.map(team => (
              <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Risk Level</InputLabel>
          <Select
            value={riskLevel}
            onChange={e => setRiskLevel(e.target.value)}
            label="Risk Level"
          >
            {['High', 'Medium', 'Low'].map(level => (
              <MenuItem key={level} value={level}>
                <Box component="span" sx={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: riskColors[level],
                  marginRight: 1,
                  verticalAlign: 'middle'
                }} />
                {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={e => setStatus(e.target.value)}
            label="Status"
          >
            {['Active', 'Inactive'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!isValid}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObligationModal;
