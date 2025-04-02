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
import { QuarterlyTarget, QuarterlyTargetKPI, QuarterlyTargetObjective, QuarterType, AnnualTarget } from '../../../types/annualCorporateScorecard';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { updateAnnualTarget } from '../../../store/slices/scorecardSlice';
import { api } from '../../../services/api';
import { RootState } from '../../../store';
interface KPIModalProps {
  open: boolean;
  onClose: () => void;
  // objectiveName: string;
  annualTargetId: string;
  quarter: QuarterType;
  // objectiveId: string;
  // kpiIndex: number;
  selectedKPI: {
    kpi: QuarterlyTargetKPI;
    objectiveName: string;
    objectiveId: string;
    kpiIndex: number;
  }
}

interface FileToUpload {
  file: File;
  name: string;
}

const KPIModal: React.FC<KPIModalProps> = ({
  open,
  onClose,
  selectedKPI,
  annualTargetId,
  quarter,
}) => {
  const dispatch = useAppDispatch();
  const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
  const [actualAchieved, setActualAchieved] = useState(selectedKPI.kpi?.actualAchieved || '');
  const [evidence, setEvidence] = useState(selectedKPI.kpi?.evidence || '');
  const [attachments, setAttachments] = useState(selectedKPI.kpi?.attachments || []);
  const [selectedRating, setSelectedRating] = useState(selectedKPI.kpi?.ratingScore || -1);
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const [errors, setErrors] = useState<{
    actualAchieved?: string;
    evidence?: string;
    ratingScore?: string;
  }>({});

  useEffect(() => {
    setActualAchieved(selectedKPI.kpi?.actualAchieved || '');
    setEvidence(selectedKPI.kpi?.evidence || '');
    setAttachments(selectedKPI.kpi?.attachments || []);
    setSelectedRating(selectedKPI.kpi?.ratingScore || -1);
  }, [selectedKPI]);

  const validateForm = () => {
    const newErrors: {
      actualAchieved?: string;
      evidence?: string;
      ratingScore?: string;
    } = {};
    let isValid = true;

    if (!actualAchieved.trim()) {
      newErrors.actualAchieved = 'Actual achieved is required';
      isValid = false;
    }

    if (!evidence.trim()) {
      newErrors.evidence = 'Evidence is required';
      isValid = false;
    }

    if (selectedRating === -1) {
      newErrors.ratingScore = 'Rating score is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const uploadedFiles = await Promise.all(
        filesToUpload.map(async (fileData) => {
          try {
            const formData = new FormData();
            formData.append('file', fileData.file);

            const response = await api.post('/score-card/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (response.status === 200) {
              return {
                name: fileData.name,
                url: response.data.data
              };
            } else {
              return null;
            }
          } catch (error) {
            console.error('Error uploading file:', error);
            return null;
          }
        })
      );

      const existingAttachments = attachments.filter(
        att => !filesToUpload.find(f => f.name === att.name)
      );

      const finalAttachments = [...existingAttachments, ...uploadedFiles];

      const annualTarget = annualTargets.find(target => target._id === annualTargetId);
      if (!annualTarget) {
        return;
      }
      const updatedAnnualTarget = {
        ...annualTarget,
        content: {
          ...annualTarget.content,
          quarterlyTarget: {
            ...annualTarget.content.quarterlyTarget,
            quarterlyTargets: annualTarget.content.quarterlyTarget.quarterlyTargets.map(quarterlyTarget =>
              quarterlyTarget.quarter === quarter
                ? {
                  ...quarterlyTarget,
                  objectives: quarterlyTarget.objectives.map(objective => ({
                    ...objective,
                    KPIs: objective.KPIs.map(kpi =>
                      kpi.indicator === selectedKPI.kpi.indicator
                        ? { ...kpi, actualAchieved, evidence, ratingScore: Number(selectedRating), attachments: finalAttachments }
                        : kpi
                    ),
                  })),
                }
                : quarterlyTarget
            ),
          },
        },
      };

      if (updatedAnnualTarget) {
        dispatch(updateAnnualTarget(updatedAnnualTarget as AnnualTarget));
      }

      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: FileToUpload[] = [];
      const newAttachments = [...attachments];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newFiles.push({
          file,
          name: file.name
        });
        newAttachments.push({
          name: file.name,
          url: URL.createObjectURL(file)
        });
      }

      setFilesToUpload(prev => [...prev, ...newFiles]);
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
            <Typography variant="body1" sx={{ color: '#4B5563' }}>{selectedKPI.kpi.indicator}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#6B7280' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1 }}>Target</Typography>
            <Typography variant="body1" sx={{ color: '#111827' }}>{selectedKPI.kpi.target}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#374151', mb: 1 }}>Actual Achieved</Typography>
            <TextField
              fullWidth
              value={actualAchieved}
              onChange={(e) => setActualAchieved(e.target.value)}
              variant="outlined"
              size="small"
              error={!!errors.actualAchieved}
              helperText={errors.actualAchieved}
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
              onChange={(e) => setSelectedRating(Number(e.target.value))}
              size="small"
              error={!!errors.ratingScore}
              sx={{
                backgroundColor: '#F9FAFB',
                color: selectedKPI.kpi.ratingScales.find(scale => scale.score === selectedRating)?.color || '#000',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#E5E7EB' },
                }
              }}
            >
              {selectedKPI.kpi.ratingScales.map((scale) => (
                <MenuItem key={scale.score} value={scale.score} sx={{ color: scale.color }}>
                  {
                    `${scale.score} ${scale.name} (${scale.min} - ${scale.max})`
                  }
                </MenuItem>
              ))}
            </Select>
            {errors.ratingScore && (
              <Typography color="error" variant="caption">
                {errors.ratingScore}
              </Typography>
            )}
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
            error={!!errors.evidence}
            helperText={errors.evidence}
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
                      {attachment.name}
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