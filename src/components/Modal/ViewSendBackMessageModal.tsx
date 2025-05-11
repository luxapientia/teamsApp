import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

interface ViewSendBackMessageModalProps {
  open: boolean;
  onClose: () => void;
  emailSubject: string;
  emailBody: string;
}

const ViewSendBackMessageModal: React.FC<ViewSendBackMessageModalProps> = ({
  open,
  onClose,
  emailSubject,
  emailBody
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {emailSubject}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {emailBody}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSendBackMessageModal; 