import { Theme } from '@mui/material';
import { COLLAPSED_DRAWER_WIDTH } from '~/components';
import { DRAWER_WIDTH } from '~/components';

export const snackbarStyles = (theme: Theme, isOpen: boolean, index: number) => ({
  position: 'fixed',
  left: {
    xs: '50%',
    sm: `calc(50% + ${isOpen ? DRAWER_WIDTH / 2 : COLLAPSED_DRAWER_WIDTH / 2}px)`
  },
  transform: 'translateX(-50%)',
  top: `${24 + index * 80}px !important`,
  zIndex: 9999,
  width: {
    xs: 'calc(100% - 48px)',
    sm: 'auto'
  },
  '& .MuiAlert-root': {
    minWidth: {
      sm: '300px'
    },
    maxWidth: {
      xs: '100%',
      sm: '600px'
    },
    boxShadow: theme.shadows[3]
  }
});

export const alertStyles = {
  width: '100%',
  '& .MuiAlert-message': {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    wordBreak: 'break-word'
  },
  '& .MuiAlert-icon': {
    color: 'white'
  },
  '& .MuiAlert-action': {
    color: 'white'
  }
};
