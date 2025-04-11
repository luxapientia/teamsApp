import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AnnualTarget, PageProps } from '../../types';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAnnualTargets } from '../../store/slices/scorecardSlice';
import { RootState } from '../../store';
import { useAppSelector } from '../../hooks/useAppSelector';
import { api } from '../../services/api';
import { Notification } from '@/types';
import PersonalQuarterlyTargetContent from './quarterly_target';
import PersonalPerformanceAssessmentContent from './performance_assessment';
const ViewButton = styled(Button)({
  backgroundColor: '#0078D4',
  color: 'white',
  textTransform: 'none',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: '#106EBE',
  },
});

const NotificationPage: React.FC<PageProps> = ({ title, icon, tabs, selectedTab }) => {
  const dispatch = useAppDispatch();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showTable, setShowTable] = useState(true);

  // Mock data - replace with actual data from your API
  const notifications = useAppSelector((state: RootState) => state.notification.notifications);
  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
  const teams = useAppSelector((state: RootState) => state.teams.teams);

  const handleView = async (notification: Notification) => {
    setSelectedNotification(notification);
    setShowTable(false);
    await api.post(`/notifications/read/${notification._id}`);
  };

  useEffect(() => {
    dispatch(fetchAnnualTargets());
  }, [dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      {showTable && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Annual Corporate Scorecard</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Date, Time</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {notification.sender.fullName}
                      {/* {!notification.isRead && ( */}
                      {(
                        <Chip
                          label="New"
                          size="small"
                          color="error"
                          sx={{
                            height: '20px',
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{teams.find((team) => team._id === notification.sender.teamId)?.name}</TableCell>
                  <TableCell>{annualTargets.find((target) => target._id === notification.annualTargetId)?.name}</TableCell>
                  <TableCell>{`Approve ${notification.quarter} ${notification.type === 'agreement' ? 'Quarterly Target' : 'Performance Assessment'}`}</TableCell>
                  <TableCell>{new Date(notification.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <ViewButton
                      variant="contained"
                      onClick={() => handleView(notification)}
                    >
                      View
                    </ViewButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedNotification && (selectedNotification.type === 'agreement' ? (
        <PersonalQuarterlyTargetContent
          notification={selectedNotification}
          annualTarget={annualTargets.find((target) => target._id === selectedNotification.annualTargetId) as AnnualTarget}
          quarter={selectedNotification.quarter}
          onBack={() => {
            setSelectedNotification(null);
            setShowTable(true);
          }}
        />
      ) : (
        <PersonalPerformanceAssessmentContent
          notification={selectedNotification}
          annualTarget={annualTargets.find((target) => target._id === selectedNotification.annualTargetId) as AnnualTarget}
          quarter={selectedNotification.quarter}
          onBack={() => {
            setSelectedNotification(null);
            setShowTable(true);
          }}
        />
      ))}
    </Box>
  );
};

export default NotificationPage; 
