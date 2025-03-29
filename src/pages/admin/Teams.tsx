import React, { useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createTeam } from '../../store/slices/teamsSlice';
import { RootState } from '../../store';
import { useAppSelector } from '../../hooks/useAppSelector';

enum ViewStatus {
  TEAM_LIST = 'TEAM_LIST',
  TEAM_ADDING = 'TEAM_ADDING',
  MEMBER_LIST = 'MEMBER_LIST',
  MEMBER_ADDING = 'MEMBER_ADDING',
};

const Teams: React.FC = () => {
  const [status, setStatus] = useState<ViewStatus>(ViewStatus.TEAM_LIST);
  const teams = useAppSelector((state: RootState) => state.teams);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const handleViewClick = (teamId: string) => {
    setStatus(ViewStatus.MEMBER_LIST);
    setSelectedTeamId(teamId);
  };

  const handleBackClick = () => {
    setStatus(ViewStatus.TEAM_LIST);
  };

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

      {status.includes('LIST') &&
        <Button
          variant="text"
          startIcon={<AddIcon />}
          // onClick={() => setIsModalOpen(true)}
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
          {status === ViewStatus.TEAM_LIST ? 'Add Team' : 'Add Member'}
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
            {status === ViewStatus.TEAM_LIST && teams.map(team => (
              <TableRow key={team.name}>
                <TableCell>{team.name}</TableCell>
                <TableCell align="right">
                  <Button variant="contained" onClick={() => handleViewClick(team.id)}>
                    View
                  </Button>
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