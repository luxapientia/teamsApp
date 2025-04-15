import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  styled,
  SelectChangeEvent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
  IconButton,
  TextField,
} from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';
import { QuarterType, AnnualTarget } from '../../../types/annualCorporateScorecard';
import PersonalQuarterlyTargetContent from './PersonalQuarterlyTarget';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import { api } from '../../../services/api';

const StyledFormControl = styled(FormControl)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: '#D1D5DB',
    },
  },
});

const ViewButton = styled(Button)({
  backgroundColor: '#0078D4',
  color: 'white',
  textTransform: 'none',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: '#106EBE',
  },
});

const AccessButton = styled(Button)({
  backgroundColor: '#0078D4',
  color: 'white',
  textTransform: 'none',
  padding: '6px 16px',
  minWidth: 'unset',
  '&:hover': {
    backgroundColor: '#106EBE',
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#374151',
  '&:first-of-type': {
    width: '25%', // Full Name column
  },
  '&:nth-of-type(2)': {
    width: '20%', // Job Title column
  },
  '&:nth-of-type(3)': {
    width: '20%', // Team column
  },
  '&:nth-of-type(4)': {
    width: '15%', // Status column
  },
  '&:last-of-type': {
    width: '20%', // Actions column
  }
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#6B7280',
  fontWeight: 500,
  '&:first-of-type': {
    width: '25%', // Full Name column
  },
  '&:nth-of-type(2)': {
    width: '20%', // Job Title column
  },
  '&:nth-of-type(3)': {
    width: '20%', // Team column
  },
  '&:nth-of-type(4)': {
    width: '15%', // Status column
  },
  '&:last-of-type': {
    width: '20%', // Actions column
  }
}));

const ExportButton = styled(Button)({
  backgroundColor: '#fff',
  color: '#374151',
  textTransform: 'none',
  padding: '6px 16px',
  border: '1px solid #E5E7EB',
  '&:hover': {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  '&.excel': {
    '&:hover': {
      color: '#059669',
      borderColor: '#059669',
    },
  },
  '&.pdf': {
    '&:hover': {
      color: '#DC2626',
      borderColor: '#DC2626',
    },
  }
});

interface TeamMember {
  fullName: string;
  jobTitle: string;
  team: string;
}

const TeamPerformanceAgreements: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showPersonalQuarterlyTarget, setShowPersonalQuarterlyTarget] = useState(false);
  const teamPerformances = useAppSelector((state: RootState) => state.personalPerformance.teamPerformances);

  const annualTargets = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets
  );

  const selectedAnnualTarget = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    setShowTable(false);
  };

  const handleQuarterChange = (event: SelectChangeEvent) => {
    setSelectedQuarter(event.target.value);
    setShowTable(false);
  };

  const handleView = () => {
    if (selectedAnnualTargetId && selectedQuarter) {
      setShowTable(true);
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StyledFormControl fullWidth>
          <InputLabel>Annual Corporate Scorecard</InputLabel>
          <Select
            value={selectedAnnualTargetId}
            label="Annual Corporate Scorecard"
            onChange={handleScorecardChange}
          >
            {annualTargets.map((target) => (
              <MenuItem key={target._id} value={target._id}>
                {target.name}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <StyledFormControl sx={{ minWidth: 200 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            value={selectedQuarter}
            label="Quarter"
            onChange={handleQuarterChange}
          >
            {selectedAnnualTarget?.content.quarterlyTarget.quarterlyTargets.map((quarter) => (
              <MenuItem key={quarter.quarter} value={quarter.quarter}>
                {quarter.quarter}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>

        <ViewButton
          variant="contained"
          disabled={!selectedAnnualTargetId || !selectedQuarter}
          onClick={handleView}
        >
          View
        </ViewButton>
      </Box>

      {showTable && (
        <Paper sx={{ mt: 3, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledHeaderCell>Full Name</StyledHeaderCell>
                <StyledHeaderCell>Job Title</StyledHeaderCell>
                <StyledHeaderCell>Team</StyledHeaderCell>
                <StyledHeaderCell>Status</StyledHeaderCell>
                <StyledHeaderCell align="center">Actions</StyledHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamPerformances.map((teamPerformance, index) => (
                <TableRow key={index}>
                  <StyledTableCell>{teamPerformance.fullName}</StyledTableCell>
                  <StyledTableCell>{teamPerformance.jobTitle}</StyledTableCell>
                  <StyledTableCell>{teamPerformance.team}</StyledTableCell>
                  <StyledTableCell>{teamPerformance.quarterlyTargets.find(target => target.quarter === selectedQuarter)?.assessmentStatus}</StyledTableCell>
                  <StyledTableCell align="center">
                    <AccessButton
                      size="small"
                      onClick={() => {
                        setShowPersonalQuarterlyTarget(true);
                        setShowTable(false);
                        setSelectedUserId(typeof teamPerformance.userId === 'string' ? teamPerformance.userId : teamPerformance.userId?._id);
                        setSelectedTeamId(teamPerformance.teamId);
                      }}
                    >
                      View
                    </AccessButton>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      {showPersonalQuarterlyTarget && (
        <PersonalQuarterlyTargetContent
          annualTarget={selectedAnnualTarget as AnnualTarget}
          quarter={selectedQuarter as QuarterType}
          onBack={() => {
            setShowPersonalQuarterlyTarget(false);
            setShowTable(true);
          }}
          userId={selectedUserId}
          teamId={selectedTeamId}
        />
      )}
    </Box>
  );
};

export default TeamPerformanceAgreements;
