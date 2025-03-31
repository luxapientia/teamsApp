import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  styled,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { QuarterlyTargetKPI, QuarterType } from '../../types/annualCorporateScorecard';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateAnnualTarget } from '../../store/slices/scorecardSlice';

interface KPIModalProps {
  open: boolean;
  onClose: () => void;
  kpi: QuarterlyTargetKPI;
  objectiveName: string;
  annualTargetId: string;
  quarter: QuarterType;
  objectiveId: string;
  kpiIndex: number;
}

const KPIModal: React.FC<KPIModalProps> = ({ 
  open, 
  onClose, 
  kpi, 
  objectiveName,
  annualTargetId,
  quarter,
  objectiveId,
  kpiIndex
}) => {
  const dispatch = useAppDispatch();
  const [actualAchieved, setActualAchieved] = useState(kpi.actualAchieved);
  const [evidence, setEvidence] = useState(kpi.evidence);
  const [attachments, setAttachments] = useState(kpi.attachments);
  const [selectedRating, setSelectedRating] = useState(kpi.actualAchieved);

  useEffect(() => {
    setActualAchieved(kpi.actualAchieved);
    setEvidence(kpi.evidence);
    setAttachments(kpi.attachments);
    setSelectedRating(kpi.actualAchieved);
  }, [kpi]);

  const handleSubmit = () => {
    // dispatch(updateAnnualTarget({
    //   _id: annualTargetId,
    //   content: {
    //     quarterlyTarget: {
    //       ...kpi.quarterlyTarget,
    //       kpis: kpi.quarterlyTarget.kpis.map((kpi, index) => 
    //         index === kpiIndex ? {
    //           ...kpi,
    //           actualAchieved,
    //           evidence,
    //           attachments,
    //           ratingScale: selectedRating
    //         } : kpi
    //       )
    //     }
    //   }
    // }));
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // TODO: Implement file upload logic
      const newAttachments = [...attachments];
      for (let i = 0; i < files.length; i++) {
        newAttachments.push(files[i].name);
      }
      setAttachments(newAttachments);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#111827', mb: 1 }}>Key Performance Indicator</Typography>
            <Typography variant="body1" sx={{ color: '#4B5563' }}>{kpi.indicator}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#6B7280' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1 }}>Target</Typography>
            <Typography variant="body1" sx={{ color: '#111827' }}>{kpi.target}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1 }}>Actual Achieved</Typography>
            <TextField
              fullWidth
              value={actualAchieved}
              onChange={(e) => setActualAchieved(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: '#F9FAFB',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E5E7EB' },
                }
              }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1 }}>Performance Rating Score</Typography>
            <Select
              fullWidth
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              size="small"
              sx={{
                backgroundColor: '#F9FAFB',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E5E7EB' },
                }
              }}
            >
              {kpi.ratingScales.map((scale) => (
                <MenuItem key={scale.score} value={scale.score}>
                  {scale.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1 }}>Evidence</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            variant="outlined"
            sx={{
              backgroundColor: '#F9FAFB',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#E5E7EB' },
              }
            }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ color: '#374151', mb: 2 }}>Attachments</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {attachments.map((attachment, index) => (
              <Grid key={index} component="div" sx={{ mb: 1 }} >
                <Box
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 1,
                    overflow: 'hidden',
                    height: '150px',
                    position: 'relative',
                    '&:hover .delete-button': {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: '100px',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <InsertDriveFileIcon sx={{ fontSize: 48, color: '#6B7280' }} />
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography 
                      sx={{ 
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {attachment}
                    </Typography>
                  </Box>
                  <IconButton 
                    className="delete-button"
                    size="small" 
                    sx={{ 
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: '#DC2626',
                      backgroundColor: 'white',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        backgroundColor: '#FEE2E2',
                      }
                    }}
                    onClick={() => {
                      const newAttachments = attachments.filter((_, i) => i !== index);
                      setAttachments(newAttachments);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
          <input
            type="file"
            id="file-upload"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<AddIcon />}
              sx={{
                color: '#6B7280',
                borderColor: '#E5E7EB',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  backgroundColor: '#F9FAFB',
                }
              }}
            >
              Add attachment
            </Button>
          </label>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: '#374151',
              borderColor: '#E5E7EB',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: '#6264A7',
              '&:hover': {
                backgroundColor: '#4F46E5',
              }
            }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default KPIModal; 