import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  styled,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store';
import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import { fetchTeamPerformances } from '../../store/slices/personalPerformanceSlice';
import { fetchTeams, fetchTeamOwner } from '../../store/slices/teamsSlice';
import { AnnualTarget, QuarterType, AnnualTargetStatus, QuarterlyTargetObjective } from '../../types/annualCorporateScorecard';
import { TeamPerformance, AgreementStatus, AssessmentStatus } from '../../types/personalPerformance';
import HalfDoughnutCard from '../../components/HalfDoughnutCard';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface DashboardProps {
  title?: string;
  icon?: React.ReactNode;
  tabs?: string[];
  selectedTab?: string;
}

interface PendingTargetsData {
  complete: number;
  pending: number;
  metrics: Array<{
    label: string;
    value: number;
    percentage: number;
  }>;
}

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

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const Dashboard: React.FC<DashboardProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterType | ''>('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPendingTargetsTable, setShowPendingTargetsTable] = useState(false);
  const [showPendingAssessmentsTable, setShowPendingAssessmentsTable] = useState(false);
  const [showPerformanceTable, setShowPerformanceTable] = useState(false);
  const [userOwnedTeam, setUserOwnedTeam] = useState<string | null>(null);
  const [pendingTargetsData, setPendingTargetsData] = useState<PendingTargetsData>({
    complete: 0,
    pending: 0,
    metrics: [
      { label: 'Complete', value: 0, percentage: 0 },
      { label: 'Pending', value: 0, percentage: 0 }
    ]
  });
  const [pendingAssessmentsData, setPendingAssessmentsData] = useState<PendingTargetsData>({
    complete: 0,
    pending: 0,
    metrics: [
      { label: 'Complete', value: 0, percentage: 0 },
      { label: 'Pending', value: 0, percentage: 0 }
    ]
  });
  const [performanceData, setPerformanceData] = useState({
    metrics: [] as Array<{
      label: string;
      value: string;
      color: string;
      percentage: number;
    }>
  });

  const [viewMode, setViewMode] = useState<'org' | 'team' | ''>('');

  const isSuperUser = user?.role === 'SuperUser';
  const isAppOwner = user?.email === process.env.REACT_APP_OWNER_EMAIL;
  const canViewManagementCharts = isAppOwner || isSuperUser;

  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
  const teamPerformances = useAppSelector((state: RootState) => state.personalPerformance.teamPerformances);
  const selectedAnnualTarget: AnnualTarget | undefined = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );

  useEffect(() => {
    const fetchTeamOwnerFromDB = async () => {
      if (user?.id) {
        try {
          const teamInfo = await api.get(`/users/is_team_owner/${user.id}`);
          const result = teamInfo.data.data;
          setUserOwnedTeam(result.team.name);
        } catch (error) {
          console.error('Error fetching team owner:', error);
          setUserOwnedTeam(null);
        }
      }
    };
    fetchTeamOwnerFromDB();
  }, [user?.id, dispatch]);

  const calculatePersonalPerformanceScore = (objectives: QuarterlyTargetObjective[], ratingCounts: Map<number, number>) => {
    objectives.forEach(objective => {
      if (objective.KPIs.length) {
        objective.KPIs.forEach(kpi => {
          if (kpi.ratingScore) {
            ratingCounts.set(kpi.ratingScore, (ratingCounts.get(kpi.ratingScore) || 0) + 1);
          }
        });
      }
    });
  };

  const calculateAggregatePerformance = (performances: TeamPerformance[], quarter: QuarterType) => {
    const aggregateRatingCounts = new Map<number, number>();

    performances.forEach(performance => {
      const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === quarter);
      if (quarterlyTarget) {
        calculatePersonalPerformanceScore(quarterlyTarget.objectives, aggregateRatingCounts);
      }
    });

    return aggregateRatingCounts;
  };

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  const handleScorecardChange = (event: SelectChangeEvent) => {
    setSelectedAnnualTargetId(event.target.value);
    setShowDashboard(false);
    resetTables();
  };

  const handleQuarterChange = (event: SelectChangeEvent) => {
    setSelectedQuarter(event.target.value as QuarterType);
    setShowDashboard(false);
    resetTables();
  };

  const resetTables = () => {
    setShowPendingTargetsTable(false);
    setShowPendingAssessmentsTable(false);
    setShowPerformanceTable(false);
  };

  const handleView = async () => {
    if (selectedAnnualTargetId && selectedQuarter) {
      try {
        const response = await dispatch(fetchTeamPerformances(selectedAnnualTargetId));

        const performances = (response.payload as { performances: TeamPerformance[] }).performances;

        const filteredPerformances = (viewMode === 'team' && userOwnedTeam)
          ? performances.filter(p => p.team === userOwnedTeam)
          : performances;

        // Calculate agreement status counts
        let agreementComplete = 0;
        let agreementPending = 0;

        // Calculate assessment status counts
        let assessmentComplete = 0;
        let assessmentPending = 0;

        // Calculate performance rating distribution
        const ratingCounts = new Map<number, number>();
        filteredPerformances.forEach(performance => {
          const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);

          // Check agreement status
          if (quarterlyTarget?.agreementStatus === AgreementStatus.Approved) {
            agreementComplete++;
          } else {
            agreementPending++;
          }

          // Check assessment status
          if (quarterlyTarget?.assessmentStatus === AssessmentStatus.Approved) {
            assessmentComplete++;
          } else {
            assessmentPending++;
          }

          // Calculate performance score
          calculatePersonalPerformanceScore(quarterlyTarget?.objectives || [], ratingCounts);
        });

        // Calculate percentages for agreements
        const agreementTotal = agreementComplete + agreementPending;
        const agreementCompletePercentage = agreementTotal > 0 ? Math.round((agreementComplete / agreementTotal) * 100) : 0;
        const agreementPendingPercentage = agreementTotal > 0 ? Math.round((agreementPending / agreementTotal) * 100) : 0;

        // Calculate percentages for assessments
        const assessmentTotal = assessmentComplete + assessmentPending;
        const assessmentCompletePercentage = assessmentTotal > 0 ? Math.round((assessmentComplete / assessmentTotal) * 100) : 0;
        const assessmentPendingPercentage = assessmentTotal > 0 ? Math.round((assessmentPending / assessmentTotal) * 100) : 0;

        // Calculate performance rating percentages
        const totalRatings = Array.from(ratingCounts.values()).reduce((sum, count) => sum + count, 0);
        const updatedPerformanceData = {
          metrics: selectedAnnualTarget?.content.ratingScales.map(scale => {
            const count = ratingCounts.get(scale.score) || 0;
            const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
            return {
              label: scale.name,
              value: `${scale.min}-${scale.max}`,
              color: scale.color,
              percentage
            };
          }) || []
        };

        setPendingTargetsData({
          complete: agreementComplete,
          pending: agreementPending,
          metrics: [
            { label: 'Complete', value: agreementComplete, percentage: agreementCompletePercentage },
            { label: 'Pending', value: agreementPending, percentage: agreementPendingPercentage }
          ]
        });

        setPendingAssessmentsData({
          complete: assessmentComplete,
          pending: assessmentPending,
          metrics: [
            { label: 'Complete', value: assessmentComplete, percentage: assessmentCompletePercentage },
            { label: 'Pending', value: assessmentPending, percentage: assessmentPendingPercentage }
          ]
        });

        setPerformanceData(updatedPerformanceData);
        setShowDashboard(true);
      } catch (error) {
        console.error('Error fetching team performances:', error);
      }
    }
  };

  const chartData = (data: PendingTargetsData) => ({
    labels: ['Complete', 'Pending'],
    datasets: [
      {
        data: [data.complete, data.pending],
        backgroundColor: ['#00B7C3', '#FFB900'],
        borderWidth: 0,
      },
    ],
  });

  const performanceChartData = {
    labels: performanceData.metrics.map(m => m.label),
    datasets: [
      {
        data: performanceData.metrics.map(m => m.percentage),
        backgroundColor: performanceData.metrics.map(m => m.color),
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 40,
        maxBarThickness: 50,
      },
    ],
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.formattedValue}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: true,
          color: '#f0f0f0',
        },
        ticks: {
          callback: (value: number) => `${value}%`,
          font: {
            size: 11
          }
        },
      },
    },
  };

  const PendingTargetsTable = () => (
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
          {viewMode == 'team' &&
            teamPerformances
              .filter(p => !userOwnedTeam || p.team === userOwnedTeam)
              .map((performance: TeamPerformance) => {
                const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
                return (
                  <TableRow key={performance._id}>
                    <TableCell>{performance.fullName}</TableCell>
                    <TableCell>{performance.team}</TableCell>
                    <TableCell>{performance.jobTitle}</TableCell>
                    <TableCell>{selectedQuarter}</TableCell>
                    <TableCell>{quarterlyTarget?.agreementStatus}</TableCell>
                  </TableRow>
                );
              })}
          {viewMode != 'team' &&
            teamPerformances
              .map((performance: TeamPerformance) => {
                const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
                return (
                  <TableRow key={performance._id}>
                    <TableCell>{performance.fullName}</TableCell>
                    <TableCell>{performance.team}</TableCell>
                    <TableCell>{performance.jobTitle}</TableCell>
                    <TableCell>{selectedQuarter}</TableCell>
                    <TableCell>{quarterlyTarget?.agreementStatus}</TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const PendingAssessmentsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Quarter</TableCell>
            <TableCell>Assessment Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {viewMode == 'team' &&
            teamPerformances
              .filter(p => !userOwnedTeam || p.team === userOwnedTeam)
              .map((performance: TeamPerformance) => {
                const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
                return (
                  <TableRow key={performance._id}>
                    <TableCell>{performance.fullName}</TableCell>
                    <TableCell>{performance.team}</TableCell>
                    <TableCell>{performance.jobTitle}</TableCell>
                    <TableCell>{selectedQuarter}</TableCell>
                    <TableCell>{quarterlyTarget?.assessmentStatus || 'Pending'}</TableCell>
                  </TableRow>
                );
              })}
          {viewMode != 'team' &&
            teamPerformances
              .map((performance: TeamPerformance) => {
                const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
                return (
                  <TableRow key={performance._id}>
                    <TableCell>{performance.fullName}</TableCell>
                    <TableCell>{performance.team}</TableCell>
                    <TableCell>{performance.jobTitle}</TableCell>
                    <TableCell>{selectedQuarter}</TableCell>
                    <TableCell>{quarterlyTarget?.assessmentStatus || 'Pending'}</TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const PerformanceTable = () => {
    const filteredPerformances = viewMode === 'team'
      ? teamPerformances.filter(p => p.team === userOwnedTeam)
      : teamPerformances;

    // Only calculate if we have a valid quarter selected
    if (!selectedQuarter) {
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
            {selectedAnnualTarget?.content.ratingScales.map(scale => {
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

  const HeatmapByTeam = () => {
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

    const getRatingScaleInfo = (score: number | null) => {
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

    const teamsTable = teams.map((team, index) => ({
      teamName: team,
      agreement: agreementResult[index],
      assessment: assessmentResult[index],
      performance: performanceResult[index]
    }));

    console.log(teamsTable, 'teamstable')
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
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

        <StyledFormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
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

        {(isSuperUser || isAppOwner || userOwnedTeam) && (
          <StyledFormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>View Mode</InputLabel>
            <Select
              value={viewMode}
              label="View Mode"
              onChange={(e) => {
                setViewMode(e.target.value as 'org' | 'team');
                setShowDashboard(false);
                resetTables();
              }}
            >
              {(isSuperUser || isAppOwner) && <MenuItem value="org">Organization Wide</MenuItem>}
              {userOwnedTeam && <MenuItem value="team">Team View</MenuItem>}
            </Select>
          </StyledFormControl>
        )}

        <ViewButton
          variant="contained"
          disabled={!selectedAnnualTargetId}
          onClick={handleView}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          View
        </ViewButton>
      </Box>

      {showDashboard && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, sm: 3 },
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, sm: 3 },
            '& > *': {
              flex: { xs: '1 1 100%', md: '1 1 0%' },
              minWidth: { xs: '100%', md: 0 }
            },
            width: '80%',
            marginX: 'auto'
          }}>
            {(canViewManagementCharts || (userOwnedTeam && viewMode === 'team')) && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Box
                  onClick={() => setShowPendingTargetsTable(!showPendingTargetsTable)}
                  sx={{ cursor: 'pointer' }}
                >
          <HalfDoughnutCard
                    title={viewMode === 'team' ? `${userOwnedTeam} Pending Agreements` : "Pending Agreements - Company Wide"}
                    chartData={chartData(pendingTargetsData)}
                    metrics={pendingTargetsData.metrics}
          />
        </Box>
                {showPendingTargetsTable && (
                  <Box sx={{
                    overflowX: 'auto',
                    '& .MuiTableContainer-root': {
                      maxWidth: '100%'
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {viewMode === 'team' ? `${userOwnedTeam} Pending Agreements Details` : "Pending Agreements Details"}
                    </Typography>
                    <PendingTargetsTable />
                  </Box>
                )}
              </Box>
            )}

            {(canViewManagementCharts || (userOwnedTeam && viewMode === 'team')) && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Box
                  onClick={() => setShowPendingAssessmentsTable(!showPendingAssessmentsTable)}
                  sx={{ cursor: 'pointer' }}
                >
          <HalfDoughnutCard
                    title={viewMode === 'team' ? `${userOwnedTeam} Pending Assessments` : "Pending Assessments - Company Wide"}
                    chartData={chartData(pendingAssessmentsData)}
                    metrics={pendingAssessmentsData.metrics}
                  />
                </Box>
                {showPendingAssessmentsTable && (
                  <Box sx={{
                    overflowX: 'auto',
                    '& .MuiTableContainer-root': {
                      maxWidth: '100%'
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {viewMode === 'team' ? `${userOwnedTeam} Pending Assessments Details` : "Pending Assessments Details"}
                    </Typography>
                    <PendingAssessmentsTable />
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {(canViewManagementCharts || (userOwnedTeam && viewMode === 'team')) && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%'
            }}>
              <Box
                onClick={() => setShowPerformanceTable(!showPerformanceTable)}
                sx={{ cursor: 'pointer' }}
              >
                <DashboardCard>
                  <CardHeader>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 500, textAlign: 'center' }}>
                      {viewMode === 'team' ? `${userOwnedTeam} Performance` : "Company-wide Performance"}
                    </Typography>
                  </CardHeader>
                  <CardContent>
                    <Bar
                      data={performanceChartData}
                      options={performanceChartOptions}
                    />
                  </CardContent>
                </DashboardCard>
              </Box>

              {showPerformanceTable && (
                <Box sx={{
                  overflowX: 'auto',
                  '& .MuiTableContainer-root': {
                    maxWidth: '100%'
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {viewMode === 'team' ? `${userOwnedTeam} Performance Details` : "Performance Details"}
                  </Typography>
                  <PerformanceTable />
                </Box>
              )}
            </Box>
          )}

          {(canViewManagementCharts) && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%'
            }}>
              {(isAppOwner || isSuperUser) && <Box
                sx={{ cursor: 'pointer' }}
              >
                <DashboardCard>
                  <CardHeader>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 500, textAlign: 'center' }}>
                      Heatmap by Team
                    </Typography>
                  </CardHeader>
                  <CardContent>
                    <HeatmapByTeam />
                  </CardContent>
                </DashboardCard>
              </Box>}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 
