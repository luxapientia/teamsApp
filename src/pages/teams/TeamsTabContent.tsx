import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createTeam, deleteTeam, fetchTeams, fetchAllTeamMembers } from '../../store/slices/teamsSlice';
import { RootState } from '../../store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import * as microsoftTeams from "@microsoft/teams-js";
import { api } from '../../services/api';
import PeoplePickerModal, { Person } from '../../components/PeoplePickerModal';
import { useAuth } from '../../contexts/AuthContext';
import { StyledHeaderCell, StyledTableCell, ViewButton } from '../../components/StyledTableComponents';

enum ViewStatus {
  TEAM_LIST = 'TEAM_LIST',
  TEAM_ADDING = 'TEAM_ADDING',
  MEMBER_LIST = 'MEMBER_LIST',
  MEMBER_ADDING = 'MEMBER_ADDING',
}

const TeamsTabContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { teams, teamMembers, loading } = useAppSelector((state: RootState) => state.teams);
  const { user } = useAuth();
  const tenantId = user?.tenantId || '987eaa8d-6b2d-4a86-9b2e-8af581ec8056';
  const [status, setStatus] = useState<ViewStatus>(ViewStatus.TEAM_LIST);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get the members for the currently selected team
  const currentTeamMembers = selectedTeamId ? (teamMembers[selectedTeamId] || []) : [];

  const handleViewClick = (teamId: string) => {
    console.log('handleViewClick', teamId);
    setStatus(ViewStatus.MEMBER_LIST);
    setSelectedTeamId(teamId);
  };

  const handleBackClick = () => {
    setStatus(ViewStatus.TEAM_LIST);
  };

  const handleAddTeamClick = () => {
    setStatus(ViewStatus.TEAM_ADDING);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleAddMemberClick = () => {
    setIsPickerOpen(true);
  };

  const handlePeopleSelected = async (people: Person[]) => {
    console.log('Selected people:', people);
    console.log('Selected team ID:', selectedTeamId);
    try {
      await api.post(`/teams/${selectedTeamId}/members`, {
        userIds: people.map(person => person.MicrosoftId)
      });
      // Refresh all team members after adding new ones
      dispatch(fetchAllTeamMembers(tenantId));
    } catch (error) {
      console.error('Error adding team members:', error);
    }
  };

  const handleNewTeamNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTeamName(event.target.value);
  };

  const handleAddNewTeam = () => {
    if (newTeamName.trim()) {
      dispatch(createTeam({
        tenantId: tenantId,
        teamName: newTeamName
      }))
        .then(() => {
          // Refresh the teams list after creation
          dispatch(fetchTeams(tenantId));
          setNewTeamName('');
          setStatus(ViewStatus.TEAM_LIST);
        })
        .catch((error) => {
          console.error('Error creating team:', error);
        });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddNewTeam();
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    dispatch(deleteTeam(teamId))
      .then(() => {
        // Refresh the teams list after deletion
        dispatch(fetchTeams(tenantId));
      })
      .catch((error) => {
        console.error('Error deleting team:', error);
      });
  };

  // Fetch teams and all team members when component mounts or tenantId changes
  useEffect(() => {
    dispatch(fetchTeams(tenantId));
    dispatch(fetchAllTeamMembers(tenantId));
  }, [dispatch, tenantId]);

  if (loading) {
    return <Box>Loading teams...</Box>;
  }

  return (
    <Box>
      {status !== ViewStatus.TEAM_LIST &&
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBackClick}
            sx={{
              textTransform: 'none',
              borderColor: '#E5E7EB',
              color: '#374151',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            Back
          </Button>
        </Box>
      }

      {status === ViewStatus.TEAM_LIST &&
        <Button
          variant="text"
          startIcon={<AddIcon />}
          onClick={handleAddTeamClick}
          sx={{
            textTransform: 'none',
            borderColor: '#E5E7EB',
            color: '#374151',
            '&:hover': {
              borderColor: '#D1D5DB',
              backgroundColor: '#F9FAFB',
            },
            mb: 2
          }}
        >
          Add Team
        </Button>
      }

      {status === ViewStatus.MEMBER_LIST &&
        <Button
          variant="text"
          startIcon={<AddIcon />}
          onClick={handleAddMemberClick}
          sx={{
            textTransform: 'none',
            borderColor: '#E5E7EB',
            color: '#374151',
            '&:hover': {
              borderColor: '#D1D5DB',
              backgroundColor: '#F9FAFB',
            },
            mb: 2
          }}
        >
          Add Member
        </Button>
      }

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, border: '1px solid #E5E7EB' }}>
        <Table>
          <TableHead>
            {status === ViewStatus.TEAM_LIST || status === ViewStatus.TEAM_ADDING ? (
              <TableRow>
                <StyledHeaderCell>Name</StyledHeaderCell>
                <StyledHeaderCell align="center">Actions</StyledHeaderCell>
              </TableRow>
            ) : (
              <TableRow>
                <StyledHeaderCell>Name</StyledHeaderCell>
                <StyledHeaderCell>Email</StyledHeaderCell>
                <StyledHeaderCell>Role</StyledHeaderCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {status === ViewStatus.TEAM_ADDING && (
              <TableRow>
                <StyledTableCell colSpan={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      inputRef={inputRef}
                      value={newTeamName}
                      onChange={handleNewTeamNameChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter team name"
                      fullWidth
                      variant="standard"
                      sx={{ mr: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddNewTeam}
                      sx={{
                        fontSize: '0.75rem',
                        padding: '4px 12px',
                        minWidth: 'auto',
                        backgroundColor: '#0078D4',
                        '&:hover': {
                          backgroundColor: '#106EBE',
                        },
                      }}>
                      Add
                    </Button>
                  </Box>
                </StyledTableCell>
              </TableRow>
            )}

            {(status === ViewStatus.TEAM_LIST || status === ViewStatus.TEAM_ADDING) && teams.map(team => (
              <TableRow key={team._id} hover>
                <StyledTableCell>{team.name}</StyledTableCell>
                <StyledTableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleViewClick(team._id)}
                      sx={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        minWidth: 'auto',
                      }}
                    >
                      View
                    </Button>
                    {(!teamMembers[team._id] || teamMembers[team._id].length === 0) && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteTeam(team._id)}
                        sx={{
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          minWidth: 'auto',
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                </StyledTableCell>
              </TableRow>
            ))}

            {status === ViewStatus.MEMBER_LIST && currentTeamMembers.map((member, index) => (
              <TableRow key={index} hover>
                <StyledTableCell>{member.name}</StyledTableCell>
                <StyledTableCell>{member.email}</StyledTableCell>
                <StyledTableCell>{member.role}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Custom People Picker Modal */}
      <PeoplePickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectPeople={handlePeopleSelected}
        title="Select Team Members"
        multiSelect={true}
        tenantId={tenantId}
      />
    </Box>
  );
};

export default TeamsTabContent;