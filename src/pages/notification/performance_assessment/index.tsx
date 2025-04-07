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
  Button
} from '@mui/material';
import ScorecardViewModal from '../ScorecardViewModal';
import { styled } from '@mui/material/styles';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { RootState } from '../../../store';

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
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data - replace with actual data from your API
  const notifications = useAppSelector((state: RootState) => state.notification.notifications.filter((notification) => notification.type === 'assessment'));  
  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);

  const handleView = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
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
                <TableCell>{notification.sender.fullName}</TableCell>
                <TableCell>{notification.sender.team}</TableCell>
                <TableCell>{annualTargets.find((target) => target._id === notification.annualTargetId)?.name}</TableCell>
                <TableCell>{notification.quarter}</TableCell>
                <TableCell>{new Date(notification.updatedAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <ViewButton
                    variant="contained"
                    // onClick={() => handleView(notification)}
                  >
                    View
                  </ViewButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedNotification && (
        <ScorecardViewModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          scorecardData={{
            employeeName: selectedNotification.fullName,
            department: selectedNotification.team,
            period: `${selectedNotification.annualCorporateScorecard}, Q1`,
            supervisor: "Helen Chin",
            data: [
              {
                perspective: "Financial Perspective",
                strategicObjective: "Increase sales",
                initiative: "Develop new products",
                weightPercentage: 10,
                kpi: "% of revenue from existing products",
                baseline: 5,
                target: 10
              },
              {
                perspective: "Financial Perspective",
                strategicObjective: "Increase sales",
                initiative: "Develop new products",
                weightPercentage: 5,
                kpi: "% of revenue from new products",
                baseline: 5,
                target: 10
              }
            ]
          }}
        />
      )}
    </Box>
  );
};

export default PerformanceAssessmentNotification; 
