import React, { useState, useEffect } from 'react';
import { Box, Button, TableContainer, Paper, Table, TableHead, TableRow, TableBody, TextField, IconButton, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ObligationModal from './obligationModal';
import { api } from '../../../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchTeams } from '../../../store/slices/teamsSlice';
import { useAuth } from '../../../contexts/AuthContext';

const riskColors: Record<string, string> = {
  High: '#FF4D4F',    // Red
  Medium: '#FFC53D',  // Amber
  Low: '#52C41A'      // Green
};

interface ComplianceArea {
  _id: string;
  areaName: string;
}

interface Team {
  _id: string;
  name: string;
}

interface Obligation {
  _id: string;
  complianceObligation: string;
  complianceArea: ComplianceArea | string;
  frequency: string;
  lastDueDate: string;
  owner: Team | string;
  riskLevel: string;
  status: string;
}

const ComplianceObligationPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [complianceAreas, setComplianceAreas] = useState<ComplianceArea[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [editObligation, setEditObligation] = useState<Obligation | null>(null);
  const teams = useSelector((state: RootState) => state.teams.teams);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/compliance-areas').then(res => setComplianceAreas(res.data.data || []));
    api.get('/compliance-obligations').then(res => setObligations(res.data.data || []));
    if (!teams || teams.length === 0) {
      dispatch(fetchTeams(user?.tenantId));
    }
  }, [dispatch]);

  const handleSaveObligation = async (data: any) => {
    if (editObligation) {
      // Update
      const res = await api.put(`/compliance-obligations/${editObligation._id}`, {
        ...data,
      });
      setObligations(prev => prev.map(ob =>
        ob._id === editObligation._id ? res.data.data : ob
      ));
      setEditObligation(null);
    } else {
      // Create
      const res = await api.post('/compliance-obligations', {
        ...data,
      });
      setObligations(prev => [...prev, res.data.data]);
    }
    setModalOpen(false);
  };

  const handleEditClick = (ob: Obligation) => {
    setEditObligation(ob);
    setModalOpen(true);
  };

  const handleDeleteObligation = async (id: string) => {
    await api.delete(`/compliance-obligations/${id}`);
    setObligations(prev => prev.filter(ob => ob._id !== id));
  };

  const getAreaName = (area: ComplianceArea | string) => {
    if (typeof area === 'string') return complianceAreas.find(a => a._id === area)?.areaName || '';
    return area?.areaName || '';
  };
  const getTeamName = (owner: Team | string) => {
    if (typeof owner === 'string') return teams.find(t => t._id === owner)?.name || '';
    return owner?.name || '';
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setModalOpen(true); setEditObligation(null); }}
          sx={{ textTransform: 'none', backgroundColor: '#0078D4', '&:hover': { backgroundColor: '#106EBE' } }}
        >
          Add Compliance Obligation
        </Button>
      </Box>
      <ObligationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditObligation(null); }}
        onSave={handleSaveObligation}
        complianceAreas={complianceAreas}
        teams={teams}
        initialData={editObligation}
      />
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: '1px solid #E5E7EB', overflowX: 'auto', mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Compliance Obligation</TableCell>
              <TableCell>Compliance Area</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Last Due Date</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {obligations.map(ob => (
              <TableRow key={ob._id} hover>
                <TableCell>{ob.complianceObligation}</TableCell>
                <TableCell>{getAreaName(ob.complianceArea)}</TableCell>
                <TableCell>{ob.frequency}</TableCell>
                <TableCell>{ob.lastDueDate}</TableCell>
                <TableCell>{getTeamName(ob.owner)}</TableCell>
                <TableCell>
                  <Box component="span" sx={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: riskColors[ob.riskLevel],
                    marginRight: 1,
                    verticalAlign: 'middle'
                  }} />
                  {ob.riskLevel}
                </TableCell>
                <TableCell>{ob.status}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" size="small" onClick={() => handleEditClick(ob)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDeleteObligation(ob._id)}>
                    <DeleteOutlineIcon fontSize="small" />
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

export default ComplianceObligationPage;
