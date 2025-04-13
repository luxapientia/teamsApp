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
  ChartData,
} from 'chart.js';
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

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC<DashboardProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterType>('Q1');
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

  const [viewMode, setViewMode] = useState<'org' | 'team'>('org');

  const isSuperUser = user?.role === 'SuperUser';
  const isAppOwner = user?.email === process.env.REACT_APP_OWNER_EMAIL;
  const canViewManagementCharts = isAppOwner || isSuperUser;

  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
  const teamPerformances = useAppSelector((state: RootState) => state.personalPerformance.teamPerformances);
  const teams = useAppSelector((state: RootState) => state.teams.teams);
  const selectedAnnualTarget: AnnualTarget | undefined = useAppSelector((state: RootState) =>
    state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
  );

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchTeams(user.tenantId)).then((action) => {
        if (fetchTeams.fulfilled.match(action)) {
          const teams = action.payload;
          teams.forEach(team => {
            dispatch(fetchTeamOwner(team._id)).then((ownerAction) => {
              if (fetchTeamOwner.fulfilled.match(ownerAction)) {
                const { owner } = ownerAction.payload;
                if (owner && owner.email === user.email) {
                  console.log(team.name, "team name");
                  setUserOwnedTeam(team.name);
                }
              }
            });
          });
        }
      });
    }
  }, [dispatch, user]);

  const calculateQuarterScore = (objectives: QuarterlyTargetObjective[]) => {
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
        const performances = response.payload as TeamPerformance[];

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
          const score = calculateQuarterScore(quarterlyTarget?.objectives || []);
          if (score !== null) {
            ratingCounts.set(score, (ratingCounts.get(score) || 0) + 1);
          }
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
      },
    ],
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

  const PerformanceTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Quarter</TableCell>
            <TableCell>Performance Rating Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {viewMode == 'team' &&
            teamPerformances
              .filter(p => !userOwnedTeam || p.team === userOwnedTeam)
              .map((performance: TeamPerformance) => {
                const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
                const score = calculateQuarterScore(quarterlyTarget?.objectives || []);
                const ratingScale = score !== null ? selectedAnnualTarget?.content.ratingScales.find(scale => scale.score === score) : null;

                return (
                  <TableRow key={performance._id}>
                    <TableCell>{performance.fullName}</TableCell>
                    <TableCell>{performance.team}</TableCell>
                    <TableCell>{performance.jobTitle}</TableCell>
                    <TableCell>{selectedQuarter}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: ratingScale?.color }}>
                        {ratingScale ? `${score} ${ratingScale.name} (${ratingScale.min}-${ratingScale.max})` : 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            {viewMode != 'team' &&
            teamPerformances
              .map((performance: TeamPerformance) => {
                const quarterlyTarget = performance.quarterlyTargets.find(qt => qt.quarter === selectedQuarter);
                const score = calculateQuarterScore(quarterlyTarget?.objectives || []);
                const ratingScale = score !== null ? selectedAnnualTarget?.content.ratingScales.find(scale => scale.score === score) : null;

                return (
                  <TableRow key={performance._id}>
                    <TableCell>{performance.fullName}</TableCell>
                    <TableCell>{performance.team}</TableCell>
                    <TableCell>{performance.jobTitle}</TableCell>
                    <TableCell>{selectedQuarter}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: ratingScale?.color }}>
                        {ratingScale ? `${score} ${ratingScale.name} (${ratingScale.min}-${ratingScale.max})` : 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </TableContainer>
  );

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

        {(isSuperUser || isAppOwner) && userOwnedTeam && (
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
              <MenuItem value="org">Organization Wide</MenuItem>
              <MenuItem value="team">Team View</MenuItem>
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
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, sm: 3 },
          '& > *': {
            flex: { xs: '1 1 100%', md: '1 1 0%' },
            minWidth: { xs: '100%', md: 0 }
          }
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

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Box
              onClick={() => setShowPerformanceTable(!showPerformanceTable)}
              sx={{ cursor: 'pointer' }}
            >
              <HalfDoughnutCard
                title={viewMode === 'team' ? `${userOwnedTeam} Performance` : "Company-wide Performance"}
                chartData={performanceChartData}
                metrics={performanceData.metrics}
                gridLayout
              />
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
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 