import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Obligation } from '../../../../../types/compliance';

interface ComplianceTrendViewProps {
  year: string;
  quarter: string;
  obligations: Obligation[];
}

interface ComplianceData {
  quarter: string;
  compliance: number;
  nonCompliance: number;
}

const ComplianceTrendView: React.FC<ComplianceTrendViewProps> = ({ year, obligations }) => {
  const calculateCompliance = (filteredObligations: Obligation[]) => {
    if (!filteredObligations.length) return { compliance: 0, nonCompliance: 0 };
    const compliantCount = filteredObligations.filter(o => o.complianceStatus === 'Compliant').length;
    const total = filteredObligations.length;
    const compliance = Math.round((compliantCount / total) * 100);
    return {
      compliance,
      nonCompliance: 100 - compliance
    };
  };

  const getComplianceTrendData = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    // Calculate organization compliance for each quarter
    const organizationTrend: ComplianceData[] = quarters.map(q => {
      const quarterObligations = obligations.filter(o => {
        const update = o.update?.find(u => u.year === year && u.quarter === q);
        return update && update.assessmentStatus === 'Approved';
      });
      const { compliance, nonCompliance } = calculateCompliance(quarterObligations);
      return {
        quarter: q,
        compliance,
        nonCompliance
      };
    });

    // Group by teams and calculate their trends
    const teams = Array.from(new Set(obligations.map(o => o.owner.name)));
    const teamTrends = teams.map(team => {
      const teamData = quarters.map(q => {
        const quarterObligations = obligations.filter(o => {
          const update = o.update?.find(u => u.year === year && u.quarter === q);
          return update && update.assessmentStatus === 'Approved' && o.owner.name === team;
        });
        const { compliance, nonCompliance } = calculateCompliance(quarterObligations);
        return {
          quarter: q,
          compliance,
          nonCompliance
        };
      });
      return { team, data: teamData };
    });

    return { organizationTrend, teamTrends };
  };

  const { organizationTrend, teamTrends } = getComplianceTrendData();

  return (
    <Box sx={{ mt: 4 }}>
      {/* Organization Compliance Table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {year}, Organization Compliance
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Quarter</TableCell>
                <TableCell align="right">Compliance %</TableCell>
                <TableCell align="right">Non-Compliance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizationTrend.map((row) => (
                <TableRow key={row.quarter}>
                  <TableCell>{row.quarter}</TableCell>
                  <TableCell align="right">{row.compliance}%</TableCell>
                  <TableCell align="right">{row.nonCompliance}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Teams Compliance Tables */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {year}, Teams Compliance
        </Typography>
        {teamTrends.map((team) => (
          <Box key={team.team} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#666' }}>
              {team.team}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Quarter</TableCell>
                    <TableCell align="right">Compliance %</TableCell>
                    <TableCell align="right">Non-Compliance %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team.data.map((row) => (
                    <TableRow key={row.quarter}>
                      <TableCell>{row.quarter}</TableCell>
                      <TableCell align="right">{row.compliance}%</TableCell>
                      <TableCell align="right">{row.nonCompliance}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ComplianceTrendView; 