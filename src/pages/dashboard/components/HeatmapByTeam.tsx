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
import { TeamPerformance, AnnualTarget, QuarterlyTargetObjective } from '../../../types';

interface HeatmapByTeamProps {
  teamPerformances: TeamPerformance[];
  selectedQuarter: string;
  selectedAnnualTarget?: AnnualTarget;
}

interface TeamTableRow {
  teamName: string;
  agreement: number;
  assessment: number;
  performance: number | null;
}

interface RatingScaleInfo {
  color: string;
  min: string;
  max: string;
  name: string;
}

export const HeatmapByTeam: React.FC<HeatmapByTeamProps> = ({
  teamPerformances,
  selectedQuarter,
  selectedAnnualTarget
}) => {
  if (!selectedQuarter || !selectedAnnualTarget) {
    return null;
  }

  const teams = Array.from(new Set(teamPerformances.map(performance => performance.team))).sort();

  // Calculate agreement percentages
  const agreementResult = teams.map(team => {
    const agreementStatus = teamPerformances
      .filter(p => p.team === team)
      .map(performance => performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter)?.agreementStatus);
    const approvedCount = agreementStatus.filter(tmp => tmp === 'Approved').length;
    const totalCount = agreementStatus.length;
    return totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  });

  // Calculate assessment percentages
  const assessmentResult = teams.map(team => {
    const assessmentStatus = teamPerformances
      .filter(p => p.team === team)
      .map(performance => performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter)?.assessmentStatus);
    const approvedCount = assessmentStatus.filter(tmp => tmp === 'Approved').length;
    const totalCount = assessmentStatus.length;
    return totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  });

  // Calculate performance scores
  const getPersonalPerformanceScore = (objectives: QuarterlyTargetObjective[]) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    objectives.forEach(objective => {
      objective.KPIs.forEach(kpi => {
        if (kpi.ratingScore !== -1) {
          totalWeightedScore += (kpi.ratingScore * kpi.weight);
          totalWeight += kpi.weight;
        }
      });
    });

    if (totalWeight === 0) return null;
    return Math.round(totalWeightedScore / totalWeight);
  };

  const performanceResult = teams.map(team => {
    const teamMembers = teamPerformances.filter(p => p.team === team);
    const scores = teamMembers
      .map(performance => {
        const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
        return quarterlyTarget ? getPersonalPerformanceScore(quarterlyTarget.objectives) : null;
      })
      .filter((score): score is number => score !== null);

    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  });

  const getRatingScaleInfo = (score: number | null): RatingScaleInfo => {
    if (score === null) {
      return {
        color: '#666666',
        min: '0',
        max: '0',
        name: 'N/A'
      };
    }

    const ratingScale = selectedAnnualTarget.content.ratingScales.find(
      scale => scale.score === score
    );

    if (!ratingScale) {
      return {
        color: '#666666',
        min: '0',
        max: '0',
        name: 'N/A'
      };
    }

    return {
      color: ratingScale.color,
      min: ratingScale.min,
      max: ratingScale.max,
      name: ratingScale.name
    };
  };

  const teamsTable: TeamTableRow[] = teams.map((team, index) => ({
    teamName: team,
    agreement: agreementResult[index],
    assessment: assessmentResult[index],
    performance: performanceResult[index]
  }));

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Team</TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Agreements</TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Assessments</TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Performance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teamsTable.map(teamsRow => (
            <TableRow key={teamsRow.teamName} hover>
              <TableCell sx={{ fontWeight: 500 }}>
                {teamsRow.teamName}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 500 }}
              >
                {teamsRow.agreement}%
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 500 }}
              >
                {teamsRow.assessment}%
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: getRatingScaleInfo(teamsRow.performance).color,
                  fontWeight: 500
                }}
              >
                {teamsRow.performance !== null ?
                  `${teamsRow.performance} ${getRatingScaleInfo(teamsRow.performance).name} (${getRatingScaleInfo(teamsRow.performance).min}%-${getRatingScaleInfo(teamsRow.performance).max}%)`
                  : 'N/A'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 