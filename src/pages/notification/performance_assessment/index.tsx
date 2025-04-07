import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import ScorecardViewModal from '../ScorecardViewModal';
import { styled } from '@mui/material/styles';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';
import { api } from '../../../services/api';
import PersonalQuarterlyTargetContent from './PersonalQuarterlyTarget';
import { AnnualTarget, Notification } from '@/types';

interface NotificationItem {
  fullName: string;
  team: string;
  annualCorporateScorecard: string;
  action: string;
  dateTime: string;
}

const ViewButton = styled(Button)({
  backgroundColor: '#0078D4',
  color: 'white',
  textTransform: 'none',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: '#106EBE',
  },
});

const PerformanceAssessmentNotification: React.FC = () => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showTable, setShowTable] = useState(true);

  // Mock data - replace with actual data from your API
  const notifications = useAppSelector((state: RootState) => state.notification.notifications.filter((notification) => notification.type === 'assessment'));
  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowTable(false);
    api.post(`/notifications/read/${notification._id}`);
  };

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
                      {!notification.isRead && (
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
                  <TableCell>{notification.sender.team}</TableCell>
                  <TableCell>{annualTargets.find((target) => target._id === notification.annualTargetId)?.name}</TableCell>
                  <TableCell>{notification.quarter}</TableCell>
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

      {selectedNotification && (
        <PersonalQuarterlyTargetContent
          notification={selectedNotification}
          annualTarget={annualTargets.find((target) => target._id === selectedNotification.annualTargetId) as AnnualTarget}
          quarter={selectedNotification.quarter}
          onBack={() => {
            setSelectedNotification(null);
            setShowTable(true);
          }}
        />
      )}
    </Box>
  );
};

export default PerformanceAssessmentNotification; 
