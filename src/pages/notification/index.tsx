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
import { isEnabledTwoQuarterMode } from '../../utils/quarterMode';
import { QUARTER_ALIAS } from '../../constants/quarterAlias';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { useAuth } from '../../contexts/AuthContext';
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

  const { user } = useAuth();

  const handleView = async (notification: Notification) => {
    if (notification.type === 'resolve_agreement') {
      
    } else if(notification.type === 'resolve_assessment'){

    } else {
      setSelectedNotification(notification);
      setShowTable(false);
    }
    await api.post(`/notifications/read/${notification._id}`);
    dispatch(fetchNotifications());
  };

  useEffect(() => {
    dispatch(fetchAnnualTargets());
    dispatch(fetchNotifications());
    console.log(notifications);
  }, [dispatch]);

  return (
    <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
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
                  <TableCell>
                    {`${notification.type === 'resolve_agreement' || notification.type === 'resolve_assessment' ? 'Resolve' : 'Approve'} ${
                      isEnabledTwoQuarterMode(
                        annualTargets.find((target) => target._id === notification.annualTargetId)
                          ?.content.quarterlyTarget.quarterlyTargets
                          .filter((quarter) => quarter.editable)
                          .map((quarter) => quarter.quarter),
                        user?.isTeamOwner
                      ) 
                        ? QUARTER_ALIAS[notification.quarter as keyof typeof QUARTER_ALIAS] 
                        : notification.quarter
                    } ${
                      notification.type === 'agreement' || notification.type === 'resolve_agreement'
                        ? 'Performance Agreement' 
                        : 'Performance Assessment'
                    }`}
                  </TableCell>
                  <TableCell>{new Date(notification.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <ViewButton
                      variant="contained"
                      onClick={() => handleView(notification)}
                    >
                      {notification.type === 'resolve_agreement' || notification.type === 'resolve_assessment' ? 'Check' : 'View'}
                    </ViewButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedNotification && (selectedNotification.type === 'agreement' || selectedNotification.type === 'resolve_agreement' ? (
        <PersonalQuarterlyTargetContent
          notification={selectedNotification}
          annualTarget={annualTargets.find((target) => target._id === selectedNotification.annualTargetId) as AnnualTarget}
          quarter={selectedNotification.quarter}
          isEnabledTwoQuarterMode={isEnabledTwoQuarterMode(annualTargets.find((target) => target._id === selectedNotification.annualTargetId)?.content.quarterlyTarget.quarterlyTargets.filter((quarter) => (
            quarter.editable
          )).map((quarter) => (
            quarter.quarter
          )), user?.isTeamOwner)}
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
          isEnabledTwoQuarterMode={isEnabledTwoQuarterMode(annualTargets.find((target) => target._id === selectedNotification.annualTargetId)?.content.quarterlyTarget.quarterlyTargets.filter((quarter) => (
            quarter.editable
          )).map((quarter) => (
            quarter.quarter
          )), user?.isTeamOwner)}
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
