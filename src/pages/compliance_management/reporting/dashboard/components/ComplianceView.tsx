import React from 'react';
import { Box } from '@mui/material';
import ComplianceChart from '../../../../../components/ComplianceChart';
import { Obligation } from '../../../../../types/compliance';

interface ComplianceViewProps {
  year: string;
  quarter: string;
  obligations: Obligation[];
}

const ComplianceView: React.FC<ComplianceViewProps> = ({ year, quarter, obligations }) => {
  const calculateCompliance = (filteredObligations: Obligation[]) => {
    if (!filteredObligations.length) return 0;
    const compliantCount = filteredObligations.filter(o => o.complianceStatus === 'Compliant').length;
    return Math.round((compliantCount / filteredObligations.length) * 100);
  };

  const getComplianceData = () => {
    // Filter obligations for the selected year and quarter
    const filteredObligations = obligations.filter(o => {
      const update = o.update?.find(u => u.year === year && u.quarter === quarter);
      return update && update.assessmentStatus === 'Approved';
    });

    // Calculate organization-wide compliance
    const organizationCompliance = calculateCompliance(filteredObligations);

    // Group obligations by team (owner) and calculate team compliance
    const teamObligations = filteredObligations.reduce((acc: { [key: string]: Obligation[] }, curr) => {
      const teamName = curr.owner.name;
      if (!acc[teamName]) acc[teamName] = [];
      acc[teamName].push(curr);
      return acc;
    }, {});

    const teamCompliance = Object.entries(teamObligations).map(([team, obligations]) => ({
      teamName: team,
      compliancePercentage: calculateCompliance(obligations)
    }));

    return { organizationCompliance, teamCompliance };
  };

  return (
    <Box sx={{ mt: 4 }}>
      <ComplianceChart 
        title={`${year}, ${quarter} Organization Compliance`}
        compliancePercentage={getComplianceData().organizationCompliance}
      />
      
      {getComplianceData().teamCompliance.map((team) => (
        <ComplianceChart
          key={team.teamName}
          title={`${year}, ${quarter} ${team.teamName} Teams Compliance`}
          teamName={team.teamName}
          compliancePercentage={team.compliancePercentage}
        />
      ))}
    </Box>
  );
};

export default ComplianceView; 