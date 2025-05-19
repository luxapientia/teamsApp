import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box
} from '@mui/material';
import { 
  ArrowLeft24Regular,
  Add24Regular 
} from '@fluentui/react-icons';

interface ScorecardData {
  employeeName: string;
  department: string;
  period: string;
  supervisor: string;
  data: Array<{
    perspective: string;
    strategicObjective: string;
    initiative: string;
    weightPercentage: number;
    kpi: string;
    baseline: number;
    target: number;
    ratingScore?: number;
  }>;
}

interface ScorecardViewModalProps {
  open: boolean;
  onClose: () => void;
  scorecardData: ScorecardData;
}

const ScorecardViewModal: React.FC<ScorecardViewModalProps> = ({
  open,
  onClose,
  scorecardData
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ p: 0, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ mr: 2 }}
          >
            <ArrowLeft24Regular />
          </IconButton>
          <Box>
            <Typography variant="h6" component="div">
              {scorecardData.employeeName}, {scorecardData.department}, {scorecardData.period}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supervisor: {scorecardData.supervisor}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Add24Regular />}
            sx={{ borderRadius: 2 }}
          >
            Add Initiative
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Perspective</TableCell>
                <TableCell>Strategic Objective</TableCell>
                <TableCell>Initiative</TableCell>
                <TableCell>Weight %</TableCell>
                <TableCell>Key Performance Indicator</TableCell>
                <TableCell>Baseline</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Rating Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scorecardData.data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.perspective}</TableCell>
                  <TableCell>{row.strategicObjective}</TableCell>
                  <TableCell>{row.initiative}</TableCell>
                  <TableCell>{row.weightPercentage}</TableCell>
                  <TableCell>{row.kpi}</TableCell>
                  <TableCell>{row.baseline}</TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        width: 30, 
                        height: 30, 
                        border: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {row.ratingScore}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 3,
          borderTop: '1px solid #e0e0e0',
          pt: 2
        }}>
          <Typography>
            Total Weight % = {scorecardData.data.reduce((sum, item) => sum + item.weightPercentage, 0)}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              sx={{ 
                backgroundColor: 'warning.main',
                '&:hover': {
                  backgroundColor: 'warning.dark'
                }
              }}
            >
              Send Back
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ScorecardViewModal; 