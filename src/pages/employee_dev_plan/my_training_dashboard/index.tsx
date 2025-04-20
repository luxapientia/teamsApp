import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
} from '@mui/material';
import { TrainingBoard } from './components/TrainingBoard';
import { Training } from './types';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { TrainingStatus } from '../annual_org_dev_plan/plan_view';
import { AssessmentStatus } from '../../../types/personalPerformance';

const MyTrainingDashboard: React.FC = () => {
  const [requestedTrainings, setRequestedTrainings] = useState<Training[]>([]);
  const [plannedTrainings, setPlannedTrainings] = useState<Training[]>([]);
  const [completedTrainings, setCompletedTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAllTrainings();
  }, []);

  const fetchRequestedTrainings = async (existingTrainings: Training[]) => {
    try {
      const response = await api.get(`/personal-performance/personal-performances`);
      if (response.data.status === 'success') {
        const approvedCourses = response.data.data
          .filter((performance: any) => 
            performance.quarterlyTargets.some((target: any) => 
              target.assessmentStatus === AssessmentStatus.Approved &&
              target.personalDevelopment &&
              target.personalDevelopment.length > 0
            )
          )
          .flatMap((performance: any) => 
            performance.quarterlyTargets
              .filter((target: any) => target.assessmentStatus === AssessmentStatus.Approved)
              .flatMap((target: any) => 
                (target.personalDevelopment || [])
                  .map((course: any) => ({
                    id: `${performance._id}-${course.name}`,
                    name: course.name,
                    description: course.description || 'No description available',
                    date: new Date(performance.updatedAt).toLocaleDateString('en-US', { 
                      day: '2-digit',
                      month: 'short'
                    })
                  }))
                  .filter(course => 
                    !existingTrainings.some(training => training.name === course.name)
                  )
              )
          );

        setRequestedTrainings(approvedCourses);
      }
    } catch (error) {
      showToast('Failed to fetch requested trainings', 'error');
    }
  };

  const fetchAllTrainings = async () => {
    try {
      // First fetch assigned trainings
      const response = await api.get(`/training/user/${user?._id}`);
      if (response.data.status === 'success') {
        const trainings = response.data.data.trainings;
        
        const planned = trainings
          .filter((training: any) => training.status === TrainingStatus.PLANNED)
          .map((training: any) => ({
            id: training._id,
            name: training.trainingRequested,
            description: training.description || 'No description available',
            date: new Date(training.dateRequested).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short'
            })
          }));
        
        const completed = trainings
          .filter((training: any) => training.status === TrainingStatus.COMPLETED)
          .map((training: any) => ({
            id: training._id,
            name: training.trainingRequested,
            description: training.description || 'No description available',
            date: new Date(training.dateRequested).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short'
            })
          }));

        setPlannedTrainings(planned);
        setCompletedTrainings(completed);

        // Then fetch requested trainings with the existing trainings data
        await fetchRequestedTrainings([...planned, ...completed]);
      }
    } catch (error) {
      showToast('Failed to fetch trainings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        p: { xs: 2, md: 3 },
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            px: { xs: 1, md: 2 }
          }}
        >
          My Training Dashboard
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          flex: 1,
          overflow: 'hidden'
        }}>
          <TrainingBoard
            title="Requested"
            trainings={requestedTrainings}
            backgroundColor="#f5f5f5"
            chipColor="#e0e0e0"
          />
          <TrainingBoard
            title="Planned"
            trainings={plannedTrainings}
            backgroundColor="#fff3e0"
            chipColor="#2e7d32"
          />
          <TrainingBoard
            title="Completed"
            trainings={completedTrainings}
            backgroundColor="#e8f5e9"
            chipColor="#2e7d32"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default MyTrainingDashboard;
