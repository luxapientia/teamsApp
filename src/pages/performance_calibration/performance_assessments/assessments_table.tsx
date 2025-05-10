import React, { useMemo, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

export interface AssessmentRow {
  fullName: string;
  jobTitle: string;
  team: string;
  status: string;
  pmCommitteeStatus: string;
}

interface AssessmentsTableProps {
  data: AssessmentRow[];
  onView: (row: AssessmentRow) => void;
}

const AssessmentsTable: React.FC<AssessmentsTableProps> = ({ data, onView }) => {
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  const [pmStatus, setPmStatus] = useState('All');

  // Get unique teams and pm committee statuses for dropdowns
  const teams = useMemo(() => Array.from(new Set(data.map(row => row.team))), [data]);
  const pmStatuses = useMemo(() => Array.from(new Set(data.map(row => row.pmCommitteeStatus))), [data]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch =
        row.fullName.toLowerCase().includes(search.toLowerCase()) ||
        row.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        row.team.toLowerCase().includes(search.toLowerCase());
      const matchesTeam = team === 'All' || row.team === team;
      const matchesPmStatus = pmStatus === 'All' || row.pmCommitteeStatus === pmStatus;
      return matchesSearch && matchesTeam && matchesPmStatus;
    });
  }, [data, search, team, pmStatus]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search by team"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
        />
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Team</InputLabel>
          <Select
            value={team}
            label="Team"
            onChange={e => setTeam(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {teams.map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>PM Committee Status</InputLabel>
          <Select
            value={pmStatus}
            label="PM Committee Status"
            onChange={e => setPmStatus(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {pmStatuses.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '18%' }}>Full Name</TableCell>
              <TableCell sx={{ width: '22%' }}>Job Title</TableCell>
              <TableCell sx={{ width: '18%' }}>Team</TableCell>
              <TableCell sx={{ width: '14%' }}>Status</TableCell>
              <TableCell sx={{ width: '18%' }}>PM Committee Status</TableCell>
              <TableCell sx={{ width: '10%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell sx={{ width: '18%' }}>{row.fullName}</TableCell>
                <TableCell sx={{ width: '22%' }}>{row.jobTitle}</TableCell>
                <TableCell sx={{ width: '18%' }}>{row.team}</TableCell>
                <TableCell sx={{ width: '14%' }}>{row.status}</TableCell>
                <TableCell sx={{ width: '18%' }}>{row.pmCommitteeStatus}</TableCell>
                <TableCell sx={{ width: '10%' }}>
                  <Button variant="contained" color="primary" onClick={() => onView(row)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssessmentsTable;
