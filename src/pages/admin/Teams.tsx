import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createTeam, deleteTeam } from '../../store/slices/teamsSlice';
import { RootState } from '../../store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import * as microsoftTeams from "@microsoft/teams-js";

enum ViewStatus {
  TEAM_LIST = 'TEAM_LIST',
  TEAM_ADDING = 'TEAM_ADDING',
  MEMBER_LIST = 'MEMBER_LIST',
  MEMBER_ADDING = 'MEMBER_ADDING',
};

const Teams: React.FC = () => {
  const dispatch = useAppDispatch();
  const teams = useAppSelector((state: RootState) => state.teams);
  const [status, setStatus] = useState<ViewStatus>(ViewStatus.TEAM_LIST);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleViewClick = (teamId: string) => {
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
    if (isInitialized) {
      microsoftTeams.people.selectPeople().then((people) => {
        console.log('Selected people:', people);
      }).catch((error) => {
        console.error('Error selecting people:', error);
      });
    } else {
      console.error("Teams SDK is not initialized");
    }
  };

  const handleNewTeamNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTeamName(event.target.value);
  };

  const handleAddNewTeam = () => {
    if (newTeamName.trim()) {
      dispatch(createTeam(newTeamName));
      setNewTeamName('');
      setStatus(ViewStatus.TEAM_LIST);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddNewTeam();
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    dispatch(deleteTeam(teamId));
  };

  useEffect(() => {
    console.log("Checking Teams SDK...");
    if (microsoftTeams.app) {
      console.log("Teams SDK is available");
      microsoftTeams.app.initialize().then(() => {
        console.log("Teams SDK initialized");
        setIsInitialized(true);
      }).catch((error) => {
        console.error("Teams SDK initialization failed", error);
      });
    } else {
      console.warn("Not running inside Microsoft Teams");
    }
  }, []);

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
          }}
        >
          Add Member
        </Button>
      }

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {status.includes('TEAM') ? (
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {status === ViewStatus.TEAM_ADDING && (
              <TableRow>
                <TableCell>
                  <TextField
                    inputRef={inputRef}
                    value={newTeamName}
                    onChange={handleNewTeamNameChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter team name"
                    fullWidth
                    variant="standard"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    onClick={handleAddNewTeam}
                    sx={{
                      fontSize: '0.75rem',
                      padding: '4px 12px',
                      minWidth: 'auto',
                    }}>
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {status.includes('TEAM') && teams.map(team => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    onClick={() => handleViewClick(team.id)}
                    sx={{
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      minWidth: 'auto',
                    }}
                  >
                    View
                  </Button>
                  {team.members.length === 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteTeam(team.id)}
                      sx={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        minWidth: 'auto',
                        marginLeft: '8px',
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {status === ViewStatus.MEMBER_LIST && teams.find(team => team.id === selectedTeamId)?.members.map(member => (
              <TableRow key={member.name}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.title}</TableCell>
                <TableCell>{member.location}</TableCell>
                <TableCell>{member.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Teams;