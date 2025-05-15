import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, TextareaAutosize } from '@mui/material';

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (comment: string, kpiId: number) => void;
  kpiId: number;
  initialComment?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({ open, onClose, onSave, kpiId, initialComment = '' }) => {
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
          Enter Comments
        </Typography>
        <TextareaAutosize
          minRows={5}
          style={{
            width: '100%',
            borderRadius: 6,
            border: '1px solid #ccc',
            padding: 10,
            fontSize: 16,
            marginBottom: 16,
            resize: 'vertical',
          }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} sx={{ fontWeight: 500 }}>
            CANCEL
          </Button>
          <Button onClick={() => onSave(comment, kpiId)} sx={{ fontWeight: 500 }}>
            SAVE
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;
