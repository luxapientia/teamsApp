import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  styled,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FeedbackForm } from './types'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const StyledTab = styled(Tab)({
  textTransform: 'none',
  minHeight: '40px',
  padding: '8px 16px',
  backgroundColor: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: '4px',
  marginRight: '8px',
  color: '#374151',
  '&.Mui-selected': {
    backgroundColor: '#0078D4',
    color: '#fff',
    borderColor: '#0078D4',
  },
});

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface FeedbackDetailsProps {
  feedback: FeedbackForm;
  onBack: () => void;
}

const FeedbackDetails: React.FC<FeedbackDetailsProps> = ({ feedback, onBack }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Employee 360 Degree Feedback Name</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            borderColor: '#E5E7EB',
            color: '#374151',
            '&:hover': {
              borderColor: '#D1D5DB',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Back
        </Button>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="feedback tabs"
            sx={{
              '& .MuiTabs-flexContainer': {
                gap: 1,
              },
            }}
          >
            <StyledTab label="Enable Feedback" />
            <StyledTab label="% Contribution to overall performance score" />
            <StyledTab label="Feedback Responses" />
            <StyledTab label="Feedback Questions" />
            <StyledTab label="Feedback Dimensions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Enable Feedback Content */}
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            Enable Feedback Content
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Contribution Score Content */}
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            Contribution Score Content
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Feedback Responses Content */}
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            Feedback Responses Content
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Feedback Questions Content */}
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            Feedback Questions Content
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* Feedback Dimensions Content */}
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            Feedback Dimensions Content
          </Paper>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default FeedbackDetails;
