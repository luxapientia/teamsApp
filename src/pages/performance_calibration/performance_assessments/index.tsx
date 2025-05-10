import { useAppSelector } from '../../../hooks/useAppSelector';
import { RootState } from '../../../store';
import { AnnualTarget, QuarterType } from '../../../types/annualCorporateScorecard';
import { Box, Button, InputLabel, MenuItem, Select, styled, FormControl, CircularProgress } from '@mui/material';
import React, { useState } from 'react';
import AssessmentsTable from './assessments_table';
import { api } from '../../../services/api';
import PersonalQuarterlyTarget from './PersonalQuarterlyTarget';
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

export interface AssessmentRow {
  userId: string;
  fullName: string;
  jobTitle: string;
  team: string;
  status: string;
  pmCommitteeStatus: string;
}

const PerformanceAssessments: React.FC = () => {
    const [selectedAnnualTargetId, setSelectedAnnualTargetId] = useState<string>('');
    const [selectedQuarter, setSelectedQuarter] = useState<QuarterType | ''>('');
    const [showTable, setShowTable] = useState(false);
    const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewingUser, setViewingUser] = useState<AssessmentRow | null>(null);

    const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
    const selectedAnnualTarget: AnnualTarget | undefined = useAppSelector((state: RootState) =>
        state.scorecard.annualTargets.find(target => target._id === selectedAnnualTargetId)
    );

    const handleView = async () => {
        setLoading(true);
        try {
            const response = await api.get('/personal-performance/manage-performance-assessment/company-users', {
                params: {
                    annualTargetId: selectedAnnualTargetId,
                    quarter: selectedQuarter,
                },
            });
            console.log(response.data.data, 'mapped');
            const mapped: AssessmentRow[] = response.data.data
                .map((user: any) => ({
                    userId: user.id,
                    fullName: user.name,
                    jobTitle: user.position,
                    team: user.team,
                    status: 'Approved', // Only approved assessments are fetched
                    pmCommitteeStatus: user.assessmentReviewStatus || 'Not Reviewed',
                }));

            setAssessments(mapped);
            setShowTable(true);
        } catch (e) {
            setAssessments([]);
            setShowTable(false);
        }
        setLoading(false);
    };

    const handleTableView = (row: AssessmentRow) => {
        setViewingUser(row);
    };

    const handleBack = () => {
        setViewingUser(null);
        handleView();
    };

    return (
        <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
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
                        onChange={(e) => setSelectedAnnualTargetId(e.target.value as string)}
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
                        onChange={(e) => setSelectedQuarter(e.target.value as QuarterType)}
                    >
                        {selectedAnnualTarget?.content.quarterlyTarget.quarterlyTargets.map((quarter) => (
                            quarter.editable && (
                                <MenuItem key={quarter.quarter} value={quarter.quarter}>
                                    {quarter.quarter}
                                </MenuItem>
                            )
                        ))}
                    </Select>
                </StyledFormControl>

                <ViewButton
                    variant="contained"
                    disabled={!selectedAnnualTargetId}
                    onClick={handleView}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    View
                </ViewButton>
            </Box>
            {loading && <CircularProgress />}
            {showTable && !viewingUser && (
              assessments.length > 0 ? (
                <AssessmentsTable data={assessments} onView={handleTableView} />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No approved assessments found for the selected criteria.
                </Box>
              )
            )}
            {viewingUser && selectedAnnualTarget && (
              <PersonalQuarterlyTarget
                annualTarget={selectedAnnualTarget}
                quarter={selectedQuarter as QuarterType}
                userId={viewingUser.userId}
                onBack={handleBack}
              />
            )}
        </Box>
    );
};

export default PerformanceAssessments;
