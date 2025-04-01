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
import { Eye24Regular } from '@fluentui/react-icons';
import ScorecardViewModal from '../ScorecardViewModal';

interface NotificationItem {
  fullName: string;
  team: string;
  annualCorporateScorecard: string;
  action: string;
  dateTime: string;
}

const QuarterlyNotification: React.FC = () => {
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data - replace with actual data from your API
  const notifications: NotificationItem[] = [
    {
      fullName: "Nabot Uushona",
      team: "Human Capital",
      annualCorporateScorecard: "Annual Corporate 2025 - 2026",
      action: "Approve Q1 Quarterly Targets",
      dateTime: "15 March 2025, 15h30"
    },
    {
      fullName: "Nabot Uushona",
      team: "Human Capital",
      annualCorporateScorecard: "Annual Corporate 2025 - 2026",
      action: "Approve Q1 Quarterly Targets",
      dateTime: "15 March 2025, 15h30"
    }
  ];

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
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((notification, index) => (
              <TableRow key={index}>
                <TableCell>{notification.fullName}</TableCell>
                <TableCell>{notification.team}</TableCell>
                <TableCell>{notification.annualCorporateScorecard}</TableCell>
                <TableCell>{notification.action}</TableCell>
                <TableCell>{notification.dateTime}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    startIcon={<Eye24Regular />}
                    onClick={() => handleView(notification)}
                    sx={{
                      bgcolor: '#6B5ECD', // Purple color from the image
                      '&:hover': {
                        bgcolor: '#5648B8'
                      }
                    }}
                  >
                    View
                  </Button>
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

export default QuarterlyNotification; 
