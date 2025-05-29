import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ComplianceChartProps {
  title: string;
  compliancePercentage: number;
  teamName?: string;
}

const ComplianceChart: React.FC<ComplianceChartProps> = ({ title, compliancePercentage, teamName }) => {
  const data: ChartData<'pie'> = {
    labels: ['Compliance %', 'Non-Compliance %'],
    datasets: [
      {
        data: [compliancePercentage, 100 - compliancePercentage],
        backgroundColor: [
          '#2E7D32', // Green for compliance
          '#D32F2F', // Red for non-compliance
        ],
        borderColor: [
          '#1B5E20',
          '#B71C1C',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          padding: 10,
          boxWidth: 10,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  return (
    <Box sx={{ 
      backgroundColor: '#fff',
      padding: 2,
      borderRadius: 1,
      marginBottom: 2,
      width: '100%'
    }}>
      {teamName && (
        <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>
          {teamName}
        </Typography>
      )}
      <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', textAlign: 'center' }}>
        {title}
      </Typography>
      <Box sx={{ maxWidth: 300, margin: '0 auto' }}>
        <Pie data={data} options={options} />
      </Box>
    </Box>
  );
};

export default ComplianceChart; 