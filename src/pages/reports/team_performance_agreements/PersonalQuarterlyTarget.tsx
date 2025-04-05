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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RatingScalesModal from '../../../components/RatingScalesModal';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { updatePersonalPerformance } from '../../../store/slices/personalPerformanceSlice';
import { RootState } from '../../../store';
import { api } from '../../../services/api';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
interface Supervisor {
    id: string;
    name: string;
}

interface PersonalQuarterlyTargetProps {
    annualTarget: AnnualTarget;
    quarter: QuarterType;
    supervisors?: Supervisor[];
    onSupervisorChange?: (supervisorId: string) => void;
    onBack?: () => void;
    userId?: string;
}

// Add PDF styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
    },
    title: {
        fontSize: 16,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
        padding: 5,
        fontWeight: 'bold',
        fontSize: 10,
    },
    tableCell: {
        padding: 5,
        fontSize: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
});

// Update PDF Document component
const PDFDocument = ({
    annualTarget,
    quarter,
    objectives
}: {
    annualTarget: AnnualTarget;
    quarter: QuarterType;
    objectives: PersonalQuarterlyTargetObjective[];
}) => {
    // Group objectives like in the table
    const groups = objectives.reduce((acc, obj) => {
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

    // Calculate row spans
    const tableRows: Array<{
        perspectiveName?: string;
        objectiveName?: string;
        initiativeName?: string;
        kpi: QuarterlyTargetKPI;
        rowSpans: {
            perspective: number;
            objective: number;
            initiative: number;
        };
    }> = [];

    Object.values(groups).forEach(perspectiveGroup => {
        const perspectiveRows = Object.values(perspectiveGroup.objectives).reduce(
            (sum, obj) => sum + obj.initiatives.reduce(
                (kpiSum, initiative) => kpiSum + initiative.KPIs.length, 0
            ), 0
        );

        Object.values(perspectiveGroup.objectives).forEach(objectiveGroup => {
            const objectiveRows = objectiveGroup.initiatives.reduce(
                (sum, initiative) => sum + initiative.KPIs.length, 0
            );

            objectiveGroup.initiatives.forEach(initiative => {
                initiative.KPIs.forEach((kpi, kpiIndex) => {
                    tableRows.push({
                        perspectiveName: kpiIndex === 0 ? perspectiveGroup.perspectiveName : undefined,
                        objectiveName: kpiIndex === 0 ? objectiveGroup.name : undefined,
                        initiativeName: kpiIndex === 0 ? initiative.initiativeName : undefined,
                        kpi,
                        rowSpans: {
                            perspective: perspectiveRows,
                            objective: objectiveRows,
                            initiative: initiative.KPIs.length
                        }
                    });
                });
            });
        });
    });

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.title}>{`${annualTarget.name}, ${quarter}`}</Text>
                <View style={styles.table}>
                    {/* Table Headers */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { width: '15%' }]}>Perspective</Text>
                        <Text style={[styles.tableHeader, { width: '15%' }]}>Strategic Objective</Text>
                        <Text style={[styles.tableHeader, { width: '15%' }]}>Initiative</Text>
                        <Text style={[styles.tableHeader, { width: '10%' }]}>Weight %</Text>
                        <Text style={[styles.tableHeader, { width: '15%' }]}>KPI</Text>
                        <Text style={[styles.tableHeader, { width: '10%' }]}>Baseline</Text>
                        <Text style={[styles.tableHeader, { width: '10%' }]}>Target</Text>
                        <Text style={[styles.tableHeader, { width: '10%' }]}>Rating Scale</Text>
                    </View>

                    {/* Table Data */}
                    {tableRows.map((row, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={[styles.tableCell, { width: '15%', minHeight: 20 }]}>
                                {row.perspectiveName || ''}
                            </Text>
                            <Text style={[styles.tableCell, { width: '15%' }]}>
                                {row.objectiveName || ''}
                            </Text>
                            <Text style={[styles.tableCell, { width: '15%' }]}>
                                {row.initiativeName || ''}
                            </Text>
                            <Text style={[styles.tableCell, { width: '10%' }]}>
                                {row.kpi.weight}%
                            </Text>
                            <Text style={[styles.tableCell, { width: '15%' }]}>
                                {row.kpi.indicator}
                            </Text>
                            <Text style={[styles.tableCell, { width: '10%' }]}>
                                {row.kpi.baseline}
                            </Text>
                            <Text style={[styles.tableCell, { width: '10%' }]}>
                                {row.kpi.target}
                            </Text>
                            <Text style={[styles.tableCell, { width: '10%' }]}>
                                {row.kpi.ratingScore || '-'}
                            </Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

const PersonalQuarterlyTargetContent: React.FC<PersonalQuarterlyTargetProps> = ({
    annualTarget,
    quarter,
    onBack,
    supervisors = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
    ],
    onSupervisorChange = () => { },
    userId = '',
}) => {
    const dispatch = useAppDispatch();
    const [selectedSupervisor, setSelectedSupervisor] = React.useState('');
    const [personalQuarterlyObjectives, setPersonalQuarterlyObjectives] = React.useState<PersonalQuarterlyTargetObjective[]>([]);
    const [personalPerformance, setPersonalPerformance] = React.useState<PersonalPerformance | null>(null);
    const [selectedRatingScales, setSelectedRatingScales] = React.useState<AnnualTargetRatingScale[] | null>(null);

    useEffect(() => {
        fetchPersonalPerformance();
    }, []);

    useEffect(() => {
        if (personalPerformance) {
            setPersonalQuarterlyObjectives(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.objectives || []);
            setSelectedSupervisor(personalPerformance.quarterlyTargets.find(target => target.quarter === quarter)?.supervisorId || '');
        }
    }, [personalPerformance]);

    const fetchPersonalPerformance = async () => {
        try {
            const response = await api.get(`/personal-performance/personal-performance/`, {
                params: {
                    userId: userId
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

    const handleExportPDF = async () => {
        try {
            // Get the table element
            const table = document.querySelector('.performance-table');
            if (!table) return;

            // Create canvas from table
            const canvas = await html2canvas(table as HTMLElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            // Calculate dimensions
            const imgWidth = 290; // A4 width in mm
            const pageHeight = 210; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape

            // Add title
            pdf.setFontSize(16);
            pdf.text(`${annualTarget.name}, ${quarter}`, 10, 10);

            // Add table image
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                10, // x position
                20, // y position
                imgWidth,
                imgHeight
            );

            // Save PDF
            pdf.save(`performance-agreement-${quarter}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
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
                    {`${annualTarget.name}, ${quarter}`}
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleExportPDF}
                        sx={{
                            borderColor: '#E5E7EB',
                            color: '#DC2626',
                            '&:hover': {
                                borderColor: '#DC2626',
                                backgroundColor: '#FEF2F2',
                            }
                        }}
                    >
                        Export to PDF
                    </Button>
                    <Button onClick={onBack}>Back</Button>
                </Stack>
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
                    >
                        <MenuItem value="" disabled>
                            <Typography color="textSecondary">Select Supervisor</Typography>
                        </MenuItem>
                        {supervisors.map((supervisor) => (
                            <MenuItem key={supervisor.id} value={supervisor.id}>
                                {supervisor.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
