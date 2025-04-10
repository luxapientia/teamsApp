import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SendBackModalProps {
  open: boolean;
  onClose: () => void;
  onSendBack: (emailSubject: string, emailBody: string) => void;
  title: string;
  emailSubject: string;
}

const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  '& .close-button': {
    cursor: 'pointer'
  }
});

const StyledDialogContent = styled(DialogContent)({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
});

const EmailSubjectField = styled(Box)({
  '& .label': {
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  '& .subject': {
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px'
  }
});

const SendBackButton = styled(Button)({
  alignSelf: 'flex-end',
  backgroundColor: '#6B5ECD',
  color: 'white',
  '&:hover': {
    backgroundColor: '#5a4fb8'
  }
});

const SendBackModal: React.FC<SendBackModalProps> = ({
  open,
  onClose,
  onSendBack,
  title,
  emailSubject
}) => {
  const [emailBody, setEmailBody] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSendBack = () => {
    setTouched(true);
    if (!emailBody.trim()) {
      return;
    }
    onSendBack(emailSubject, emailBody);
    setEmailBody('');
    setTouched(false);
  };

  const handleClose = () => {
    onClose();
    setEmailBody('');
    setTouched(false);
  };

  const showError = touched && !emailBody.trim();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        {title}
        <span className="close-button" onClick={handleClose}>✕</span>
      </StyledDialogTitle>
      <StyledDialogContent>
        <EmailSubjectField>
          <div className="label">Email Subject</div>
          <div className="subject">{emailSubject}</div>
        </EmailSubjectField>
        <Box>
          <div className="label">Email Body</div>
          <TextField
            multiline
            rows={8}
            fullWidth
            value={emailBody}
            onChange={(e) => {
              setEmailBody(e.target.value);
              setTouched(true);
            }}
            variant="outlined"
            error={showError}
            helperText={showError ? 'Please provide a reason for sending back the performance document.' : ''}
          />
        </Box>
        <SendBackButton onClick={handleSendBack}>
          SEND BACK
        </SendBackButton>
      </StyledDialogContent>
    </Dialog>
  );
};

export default SendBackModal; 