import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  TextField,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAuth } from '../../../contexts/AuthContext';
import type { RootState } from '../../../store';
import { fetchDevPlans, createDevPlan, deleteDevPlan, updateDevPlan } from '../../../store/slices/devPlanSlice';
import { useToast } from '../../../contexts/ToastContext';

interface NewPlan {
  name: string;
}

interface EditingPlan {
  _id: string;
  name: string;
}

const AnnualOrganizationDevelopmentPlans: React.FC = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPlan, setNewPlan] = useState<NewPlan>({ name: '' });
  const [editingPlan, setEditingPlan] = useState<EditingPlan | null>(null);
  
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const { showToast } = useToast();
  
  const { plans, loading, error } = useAppSelector((state: RootState) => state.devPlan);

  useEffect(() => {
    if (tenantId) {
      dispatch(fetchDevPlans(tenantId))
        .unwrap()
        .catch((error) => {
          showToast('Failed to fetch development plans', 'error');
        });
    }
  }, [dispatch, tenantId]);

  const handleView = (id: string) => {
    console.log('View plan:', id);
  };

  const handleEdit = (plan: { _id: string; name: string }) => {
    setEditingPlan(plan);
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
  };

  const handleSaveEdit = async () => {
    if (editingPlan && editingPlan.name.trim()) {
      try {
        await dispatch(updateDevPlan({ 
          planId: editingPlan._id, 
          name: editingPlan.name 
        })).unwrap();
        showToast('Plan updated successfully', 'success');
        setEditingPlan(null);
      } catch (error) {
        showToast('Failed to update plan', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteDevPlan(id)).unwrap();
      showToast('Plan deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete plan', 'error');
    }
  };

  const handleNewPlan = () => {
    setIsAddingNew(true);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewPlan({ name: '' });
  };

  const handleSaveNewPlan = async () => {
    if (newPlan.name.trim() && tenantId) {
      try {
        await dispatch(createDevPlan({ name: newPlan.name, tenantId })).unwrap();
        showToast('Plan created successfully', 'success');
        setIsAddingNew(false);
        setNewPlan({ name: '' });
      } catch (error) {
        showToast('Failed to create plan', 'error');
      }
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error loading development plans</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6">
          Employees Development Plan
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewPlan}
          disabled={isAddingNew || loading}
          sx={{
            backgroundColor: '#0078D4',
            '&:hover': {
              backgroundColor: '#106EBE',
            },
          }}
        >
          New Plan
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Plan Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAddingNew && (
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Enter plan name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ name: e.target.value })}
                      autoFocus
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      size="small"
                      onClick={handleSaveNewPlan}
                      sx={{ color: '#0078D4' }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleCancelAdd}
                      sx={{ color: '#d92d20' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No development plans found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow
                  key={plan._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {editingPlan?._id === plan._id ? (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          size="small"
                          value={editingPlan.name}
                          onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                          autoFocus
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    ) : (
                      plan.name
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleView(plan._id)}
                        sx={{ color: '#0078D4' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {editingPlan?._id === plan._id ? (
                        <>
                          <IconButton
                            size="small"
                            onClick={handleSaveEdit}
                            sx={{ color: '#0078D4' }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelEdit}
                            sx={{ color: '#d92d20' }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(plan)}
                            sx={{ color: '#0078D4' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(plan._id)}
                            sx={{ color: '#d92d20' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AnnualOrganizationDevelopmentPlans;
