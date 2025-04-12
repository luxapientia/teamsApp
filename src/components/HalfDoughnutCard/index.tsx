import React from 'react';
import { Box, Paper, Typography, styled, LinearProgress } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface MetricItem {
  label: string;
  value: string | number;
  percentage?: number;
  color?: string;
}

interface HalfDoughnutCardProps {
  title: string;
  chartData: ChartData<'doughnut', number[], string>;
  metrics: MetricItem[];
  gridLayout?: boolean;
}

const DashboardCard = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: 'none',
  backgroundColor: '#EBF8FF',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: '16px 24px',
  backgroundColor: '#0097A7',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}));

const MetricRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '32px',
  borderRadius: '4px',
  backgroundColor: '#E5E7EB',
  '& .MuiLinearProgress-bar': {
    borderRadius: '4px',
  },
}));

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  rotation: -90,
  circumference: 180,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
};

const HalfDoughnutCard: React.FC<HalfDoughnutCardProps> = ({
  title,
  chartData,
  metrics,
  gridLayout = false,
}) => {
  return (
    <DashboardCard>
      <CardHeader>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500, textAlign: 'center'  }}>
          {title}
        </Typography>
      </CardHeader>
      <CardContent>
        <Box sx={{ height: 300, position: 'relative' }}>
          <Doughnut data={chartData} options={chartOptions} />
        </Box>
        <Box sx={{ width: '100%', height: '1px', backgroundColor: '#E5E7EB' }} />
        <MetricBox>
          {metrics.map((metric, index) => (
            <Box key={index}>
              <MetricRow>
                <Typography sx={{ color: '#111827', fontWeight: 500 }}>
                  {metric.label}
                </Typography>
                <Typography sx={{ color: '#111827', fontWeight: 600 }}>
                  {metric.value}
                  {metric.percentage !== undefined && ` (${metric.percentage}%)`}
                </Typography>
              </MetricRow>
              <StyledLinearProgress
                variant="determinate"
                value={metric.percentage || 0}
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: metric.color || (index === 0 ? '#00B7C3' : '#FFB900'),
                  },
                }}
              />
            </Box>
          ))}
        </MetricBox>
      </CardContent>
    </DashboardCard>
  );
};

export default HalfDoughnutCard; 