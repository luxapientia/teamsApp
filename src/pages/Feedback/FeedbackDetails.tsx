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
import { StyledTab, StyledTabs } from '../../components/StyledTab';
import FeedbackDimensionsTab from './tabs/feedback_dimensions';
import FeedbackQuestionsTab from './tabs/feedback_questions';
import FeedbackResponsesTab from './tabs/feedback_responses';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store';
import EnableFeedbackTab from './tabs/enable_feedback';
import ContributionScoreTab from './tabs/contribution_score';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
  feedbackId: string;
  onBack: () => void;
}

const FeedbackDetails: React.FC<FeedbackDetailsProps> = ({ feedbackId, onBack }) => {
  const [tabValue, setTabValue] = useState(0);

  const feedback = useAppSelector((state: RootState) => state.feedback.feedbacks.find((feedback) => feedback._id === feedbackId));  

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">{feedback.name}</Typography>
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
          <StyledTabs
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
          </StyledTabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Enable Feedback Content */}
          <EnableFeedbackTab feedbackId={feedbackId} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Contribution Score Content */}
          <ContributionScoreTab feedbackId={feedbackId} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Feedback Responses Content */}
          <FeedbackResponsesTab feedbackId={feedbackId} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Feedback Questions Content */}
          <FeedbackQuestionsTab feedbackId={feedbackId} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* Feedback Dimensions Content */}
          <FeedbackDimensionsTab feedbackId={feedbackId} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default FeedbackDetails;
