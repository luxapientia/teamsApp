import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { TeamPerformance } from '../../../types';
import { QUARTER_ALIAS } from '../../../constants/quarterAlias';
interface PendingTargetsTableProps {
  teamPerformances: TeamPerformance[];
  selectedQuarter: string;
  isEnabledTwoQuarterMode: boolean;
  viewMode: string;
  userOwnedTeam?: string | null;
}

export const PendingTargetsTable: React.FC<PendingTargetsTableProps> = ({
  teamPerformances,
  selectedQuarter,
  viewMode,
  userOwnedTeam,
  isEnabledTwoQuarterMode
}) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Full Name</TableCell>
          <TableCell>Team</TableCell>
          <TableCell>Position</TableCell>
          <TableCell>Quarter</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {viewMode === 'team' &&
          teamPerformances
            .filter(p => !userOwnedTeam || p.team === userOwnedTeam)
            .map((performance: TeamPerformance) => {
              const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
              return (
                <TableRow key={performance._id}>
                  <TableCell>{performance.fullName}</TableCell>
                  <TableCell>{performance.team}</TableCell>
                  <TableCell>{performance.jobTitle}</TableCell>
                  <TableCell>{isEnabledTwoQuarterMode ? QUARTER_ALIAS[selectedQuarter as keyof typeof QUARTER_ALIAS] : selectedQuarter}</TableCell>
                  <TableCell>{quarterlyTarget?.agreementStatus}</TableCell>
                </TableRow>
              );
            })}
        {viewMode !== 'team' &&
          teamPerformances
            .map((performance: TeamPerformance) => {
              const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
              return (
                <TableRow key={performance._id}>
                  <TableCell>{performance.fullName}</TableCell>
                  <TableCell>{performance.team}</TableCell>
                  <TableCell>{performance.jobTitle}</TableCell>
                  <TableCell>{isEnabledTwoQuarterMode ? QUARTER_ALIAS[selectedQuarter as keyof typeof QUARTER_ALIAS] : selectedQuarter}</TableCell>
                  <TableCell>{quarterlyTarget?.agreementStatus}</TableCell>
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  </TableContainer>
); 