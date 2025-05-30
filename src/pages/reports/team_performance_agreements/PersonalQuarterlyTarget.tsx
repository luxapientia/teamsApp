import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Paper,
    TableContainer,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    IconButton,
    Stack,
    CircularProgress,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { AnnualTarget, QuarterType, QuarterlyTargetObjective, AnnualTargetPerspective, QuarterlyTargetKPI, AnnualTargetRatingScale } from '@/types/annualCorporateScorecard';
import { StyledHeaderCell, StyledTableCell } from '../../../components/StyledTableComponents';
import { PersonalQuarterlyTargetObjective, PersonalPerformance, PersonalQuarterlyTarget } from '@/types/personalPerformance';
import RatingScalesModal from '../../../components/RatingScalesModal';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QUARTER_ALIAS } from '../../../constants/quarterAlias';
interface PersonalQuarterlyTargetProps {
    annualTarget: AnnualTarget;
    quarter: QuarterType;
    onBack?: () => void;
    userId: string;
    teamId: string;
    userName: string;
    isEnabledTwoQuarterMode: boolean;
}

const PersonalQuarterlyTargetContent: React.FC<PersonalQuarterlyTargetProps> = ({
    annualTarget,
    quarter,
    onBack,
    userId,
    teamId,
    userName,
    isEnabledTwoQuarterMode
}) => {
    const [selectedSupervisor, setSelectedSupervisor] = React.useState('');
    const [personalQuarterlyObjectives, setPersonalQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
    const [personalPerformance, setPersonalPerformance] = React.useState<PersonalPerformance | null>(null);
    const [selectedRatingScales, setSelectedRatingScales] = React.useState<AnnualTargetRatingScale[] | null>(null);
    const [companyUsers, setCompanyUsers] = useState<{ id: string, fullName: string, jobTitle: string, team: string, teamId: string }[]>([]);

    useEffect(() => {
        fetchPersonalPerformance();
        fetchCompanyUsers();
    }, []);

    useEffect(() => {
        if (personalPerformance) {
            setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
            setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
        }
    }, [personalPerformance]);


    const fetchCompanyUsers = async () => {
        try {
            const response = await api.get('/report/company-users');
            if (response.status === 200) {
                setCompanyUsers(response.data.data);
            } else {
                setCompanyUsers([]);
            }
        } catch (error) {
            setCompanyUsers([]);
        }
    }

    const fetchPersonalPerformance = async () => {
        try {
            const response = await api.get(`/personal-performance/personal-performance/`, {
                params: {
                    userId: userId,
                    annualTargetId: annualTarget._id,
                    teamId: teamId
                }
            });

            if (response.status === 200) {
                setPersonalPerformance(response.data.data);
            }
        } catch (error) {
            console.error('Personal performance error:', error);
        }
    }

    // Add total weight calculation function
    const calculateTotalWeight = () => {
        return personalQuarterlyObjectives.reduce((total, objective) => {
            const totalWeight = objective.KPIs.reduce((sum, kpi) => sum + kpi.weight, 0);
            return total + totalWeight;
        }, 0);
    };

    return (
        <Box>
            <Box sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6">
                    {`${annualTarget.name}, ${userName} Performance Agreement ${isEnabledTwoQuarterMode ? QUARTER_ALIAS[quarter as keyof typeof QUARTER_ALIAS] : quarter}`}
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <FormControl
                    variant="outlined"
                    size="small"
                    sx={{
                        mt: 1,
                        minWidth: 200,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#E5E7EB',
                            },
                            '&:hover fieldset': {
                                borderColor: '#D1D5DB',
                            },
                        },
                    }}
                >
                    <Select
                        value={selectedSupervisor}
                        displayEmpty
                        disabled={true}
                    >
                        {companyUsers.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.fullName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <Button
                    onClick={onBack}
                    variant="outlined"
                    color="primary"
                    sx={{
                        minWidth: '100px',
                        '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                        }
                    }}
                >
                    Back
                </Button>
            </Box>

            {/* Add total weight display */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 2,
                    borderTop: '1px solid #E5E7EB'
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 500,
                        color: calculateTotalWeight() > 100 ? '#DC2626' : '#374151'
                    }}
                >
                    Total Weight: {calculateTotalWeight()}%
                    {calculateTotalWeight() > 100 && (
                        <Typography
                            component="span"
                            sx={{
                                color: '#DC2626',
                                ml: 2,
                                fontSize: '0.875rem'
                            }}
                        >
                            (Total weight cannot exceed 100%)
                        </Typography>
                    )}
                </Typography>
            </Box>



            <Paper
                className="performance-table"
                sx={{ width: '100%', boxShadow: 'none', border: '1px solid #E5E7EB' }}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledHeaderCell>Perspective</StyledHeaderCell>
                                <StyledHeaderCell>Strategic Objective</StyledHeaderCell>
                                <StyledHeaderCell>Initiative</StyledHeaderCell>
                                <StyledHeaderCell align="center">Weight %</StyledHeaderCell>
                                <StyledHeaderCell>Key Performance Indicator</StyledHeaderCell>
                                <StyledHeaderCell align="center">Baseline</StyledHeaderCell>
                                <StyledHeaderCell align="center">Target</StyledHeaderCell>
                                <StyledHeaderCell align="center">Rating Scale</StyledHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(() => {
                                // Group by perspective and strategic objective
                                const groups = personalQuarterlyObjectives.reduce((acc, obj) => {
                                    const perspectiveKey = `${obj.perspectiveId}`;
                                    const objectiveKey = `${obj.perspectiveId}-${obj.name}`;

                                    if (!acc[perspectiveKey]) {
                                        acc[perspectiveKey] = {
                                            perspectiveId: obj.perspectiveId,
                                            perspectiveName: annualTarget.content.perspectives.find(p => p.index === obj.perspectiveId)?.name,
                                            objectives: {}
                                        };
                                    }

                                    if (!acc[perspectiveKey].objectives[objectiveKey]) {
                                        acc[perspectiveKey].objectives[objectiveKey] = {
                                            name: obj.name,
                                            initiatives: []
                                        };
                                    }

                                    acc[perspectiveKey].objectives[objectiveKey].initiatives.push(obj);
                                    return acc;
                                }, {} as Record<string, {
                                    perspectiveId: number;
                                    perspectiveName: string | undefined;
                                    objectives: Record<string, {
                                        name: string;
                                        initiatives: PersonalQuarterlyTargetObjective[];
                                    }>;
                                }>);

                                // Calculate row spans considering KPI counts
                                return Object.values(groups).map(perspectiveGroup => {
                                    let firstInPerspective = true;
                                    // Calculate total rows for perspective including all KPIs
                                    const perspectiveRowSpan = Object.values(perspectiveGroup.objectives)
                                        .reduce((sum, obj) => sum + obj.initiatives.reduce((kpiSum, initiative) =>
                                            kpiSum + initiative.KPIs.length, 0), 0);

                                    return Object.values(perspectiveGroup.objectives).map(objectiveGroup => {
                                        let firstInObjective = true;
                                        // Calculate total rows for objective including all KPIs
                                        const objectiveRowSpan = objectiveGroup.initiatives.reduce((sum, initiative) =>
                                            sum + initiative.KPIs.length, 0);

                                        return objectiveGroup.initiatives.map((initiative) =>
                                            // Map each KPI to a row
                                            initiative.KPIs.map((kpi, kpiIndex) => {
                                                const row = (
                                                    <TableRow key={`${initiative.perspectiveId}-${initiative.name}-${initiative.initiativeName}-${kpiIndex}`}>
                                                        {firstInPerspective && kpiIndex === 0 && (
                                                            <StyledTableCell rowSpan={perspectiveRowSpan}>
                                                                {perspectiveGroup.perspectiveName}
                                                            </StyledTableCell>
                                                        )}
                                                        {firstInObjective && kpiIndex === 0 && (
                                                            <StyledTableCell rowSpan={objectiveRowSpan}>
                                                                {objectiveGroup.name}
                                                            </StyledTableCell>
                                                        )}
                                                        {kpiIndex === 0 && (
                                                            <StyledTableCell rowSpan={initiative.KPIs.length}>
                                                                {initiative.initiativeName}
                                                            </StyledTableCell>
                                                        )}
                                                        <StyledTableCell align="center">
                                                            {kpi.weight}
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            {kpi.indicator}
                                                        </StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            {kpi.baseline}
                                                        </StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            {kpi.target}
                                                        </StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    borderColor: '#E5E7EB',
                                                                    color: '#374151',
                                                                    '&:hover': {
                                                                        borderColor: '#D1D5DB',
                                                                        backgroundColor: '#F9FAFB',
                                                                    },
                                                                }}
                                                                onClick={() => {
                                                                    setSelectedRatingScales(kpi.ratingScales);
                                                                }}
                                                            >
                                                                <DescriptionIcon />
                                                            </IconButton>
                                                        </StyledTableCell>
                                                    </TableRow>
                                                );

                                                if (kpiIndex === 0) {
                                                    firstInObjective = false;
                                                }
                                                if (firstInPerspective && kpiIndex === 0) {
                                                    firstInPerspective = false;
                                                }
                                                return row;
                                            })
                                        ).flat();
                                    }).flat();
                                }).flat();
                            })()}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {selectedRatingScales && (
                <RatingScalesModal
                    open={!!selectedRatingScales}
                    onClose={() => setSelectedRatingScales(null)}
                    ratingScales={selectedRatingScales}
                />
            )}
        </Box >
    );
};

export default PersonalQuarterlyTargetContent;
