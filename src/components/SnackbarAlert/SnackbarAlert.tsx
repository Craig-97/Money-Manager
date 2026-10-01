import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { snackbarStyles, alertStyles } from '~/styles';
import { SnackbarMessage } from '~/types';

interface SnackbarAlertProps {
  message: SnackbarMessage;
  index: number;
  isOpen: boolean;
  onClose: (id: number) => void;
}

export const SnackbarAlert = ({ message, index, isOpen, onClose }: SnackbarAlertProps) => (
  <Snackbar
    key={message.id}
    open={true}
    autoHideDuration={2500}
    onClose={(event, reason) => {
      if (reason === 'clickaway') return;
      onClose(message.id);
    }}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    sx={theme => snackbarStyles(theme, isOpen, index)}
    onClick={e => e.stopPropagation()}>
    <Alert
      onClose={() => onClose(message.id)}
      severity={message.variant}
      elevation={6}
      variant="filled"
      sx={alertStyles({ variant: message.variant })}>
      {message.message}
    </Alert>
  </Snackbar>
);
