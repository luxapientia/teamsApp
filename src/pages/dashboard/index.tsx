import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, styled } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import { AnnualTargetStatus } from '../../types/annualCorporateScorecard';
import HalfDoughnutCard from '../../components/HalfDoughnutCard';

interface DashboardProps {
  title?: string;
  icon?: React.ReactNode;
  tabs?: React.ReactNode;
  selectedTab?: string;
}

ChartJS.register(ArcElement, Tooltip, Legend);

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px',
});

const Dashboard: React.FC<DashboardProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const annualTargets = useAppSelector((state) => state.scorecard.annualTargets);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await dispatch(fetchAnnualTargets()).unwrap();
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const calculateAssessmentStats = () => {
    if (!annualTargets || annualTargets.length === 0) {
      return { complete: 0, pending: 0 };
    }

    const complete = annualTargets.filter(target => target.status === AnnualTargetStatus.Active).length;
    const total = annualTargets.length;
    return {
      complete,
      pending: total - complete,
    };
  };

  const calculatePerformanceStats = () => {
    if (!annualTargets || annualTargets.length === 0) {
      return { belowPar: 0, bad: 0, normal: 0, good: 0 };
    }

    return annualTargets.reduce((acc, target) => {
      const quarterlyScores = target.content.quarterlyTarget.quarterlyTargets.map(quarter => {
        const totalScore = quarter.objectives.reduce((sum, obj) => {
          const kpiScores = obj.KPIs.reduce((kpiSum, kpi) => kpiSum + (kpi.ratingScore || 0), 0);
          return sum + kpiScores / obj.KPIs.length;
        }, 0);
        return totalScore / quarter.objectives.length;
      });

      const avgScore = quarterlyScores.reduce((sum, score) => sum + score, 0) / quarterlyScores.length;

      if (avgScore < 25) acc.belowPar++;
      else if (avgScore < 50) acc.bad++;
      else if (avgScore < 75) acc.normal++;
      else acc.good++;
      return acc;
    }, { belowPar: 0, bad: 0, normal: 0, good: 0 });
  };

  const stats = calculateAssessmentStats();
  const performanceStats = calculatePerformanceStats();

  const assessmentData: ChartData<'doughnut', number[], string> = {
    labels: ['Complete Assessments', 'Pending Assessments'],
    datasets: [
      {
        data: [stats.complete, stats.pending],
        backgroundColor: ['#00B7C3', '#FFB900'],
        borderWidth: 0,
      },
    ],
  };

  const performanceData: ChartData<'doughnut', number[], string> = {
    labels: ['Below Par', 'Bad', 'Normal', 'Good'],
    datasets: [
      {
        data: [
          performanceStats.belowPar,
          performanceStats.bad,
          performanceStats.normal,
          performanceStats.good,
        ],
        backgroundColor: ['#D13438', '#FFB900', '#00B7C3', '#107C10'],
        borderWidth: 0,
      },
    ],
  };

  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </Box>
    );
  }

  const totalAssessments = stats.complete + stats.pending;
  const completePercentage = totalAssessments > 0 
    ? Math.round((stats.complete / totalAssessments) * 100) 
    : 0;
  const pendingPercentage = totalAssessments > 0 
    ? Math.round((stats.pending / totalAssessments) * 100)
    : 0;

  const assessmentMetrics = [
    {
      label: 'Complete Assessments',
      value: stats.complete,
      percentage: completePercentage
    },
    {
      label: 'Pending',
      value: stats.pending,
      percentage: pendingPercentage
    }
  ];

  const performanceMetrics = [
    {
      label: 'Below Par',
      value: '0-25',
      color: '#D13438'
    },
    {
      label: 'Bad',
      value: '25-50',
      color: '#FFB900'
    },
    {
      label: 'Normal',
      value: '50-75',
      color: '#00B7C3'
    },
    {
      label: 'Good',
      value: '75-100',
      color: '#107C10'
    }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <HalfDoughnutCard
            title="Pending Assessments"
            chartData={assessmentData}
            metrics={assessmentMetrics}
          />
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <HalfDoughnutCard
            title="Company-wide Performance"
            chartData={performanceData}
            metrics={performanceMetrics}
            gridLayout
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 