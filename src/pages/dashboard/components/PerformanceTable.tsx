import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { TeamPerformance, AnnualTarget } from '../../../types';

interface PerformanceTableProps {
  teamPerformances: TeamPerformance[];
  selectedQuarter: string;
  viewMode: string;
  userOwnedTeam?: string;
  selectedAnnualTarget?: AnnualTarget;
}

const calculateAggregatePerformance = (performances: TeamPerformance[], quarter: string) => {
  const ratingCounts = new Map<number, number>();

  performances.forEach(performance => {
    const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === quarter);
    if (quarterlyTarget) {
      quarterlyTarget.objectives.forEach(objective => {
        objective.KPIs.forEach(kpi => {
          if (kpi.ratingScore !== -1) {
            ratingCounts.set(kpi.ratingScore, (ratingCounts.get(kpi.ratingScore) || 0) + 1);
          }
        });
      });
    }
  });

  return ratingCounts;
};

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
  teamPerformances,
  selectedQuarter,
  viewMode,
  userOwnedTeam,
  selectedAnnualTarget
}) => {
  const filteredPerformances = viewMode === 'team'
    ? teamPerformances.filter(p => p.team === userOwnedTeam)
    : teamPerformances;

  if (!selectedQuarter || !selectedAnnualTarget) {
    return null;
  }

  const aggregateRatingCounts = calculateAggregatePerformance(filteredPerformances, selectedQuarter);
  const totalRatings = Array.from(aggregateRatingCounts.values()).reduce((sum, count) => sum + count, 0);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rating Scale</TableCell>
            <TableCell>Count</TableCell>
            <TableCell>Percentage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedAnnualTarget.content.ratingScales.map(scale => {
            const count = aggregateRatingCounts.get(scale.score) || 0;
            const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

            return (
              <TableRow key={scale.score}>
                <TableCell>
                  <Typography sx={{ color: scale.color, fontWeight: 500 }}>
                    {scale.name} ({scale.min}-{scale.max})
                  </Typography>
                </TableCell>
                <TableCell>{count}</TableCell>
                <TableCell>{percentage}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 