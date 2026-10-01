import { useState } from 'react';
import { Alert, Skeleton } from '@mui/material';
import { useGetPayday } from '~/hooks';
import { formatFullDate } from '~/utils';

const PAYDAY_ALERT_CLOSED_KEY = 'paydayAlertClosed';

const getAlertClosedStatus = () => sessionStorage.getItem(PAYDAY_ALERT_CLOSED_KEY) === 'true';
const setAlertClosedStatus = (status: boolean) =>
  sessionStorage.setItem(PAYDAY_ALERT_CLOSED_KEY, status.toString());

export const PaydayAlert = () => {
  const [isOpen, setIsOpen] = useState<boolean>(() => !getAlertClosedStatus());
  const { paydayInfo, loading, error } = useGetPayday();
  const { payday, isPayday } = paydayInfo;

  const handleClose = () => {
    setIsOpen(false);
    setAlertClosedStatus(true);
  };

  if (!isOpen || error || (!loading && !payday)) {
    return null;
  }

  if (loading || !payday) {
    return (
      <Skeleton
        width="100%"
        height={48}
        sx={{
          mb: 4,
          transform: 'none',
          bgcolor: 'rgba(147, 51, 234, 0.1)' // Subtle purple loading state
        }}>
        <Alert severity="info"></Alert>
      </Skeleton>
    );
  }

  return (
    <Alert
      sx={{
        mb: 4,
        alignItems: 'center',
        backgroundColor: 'background.paper',
        backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.15), rgba(147, 51, 234, 0.15))',
        color: 'white',
        '& .MuiAlert-action': {
          padding: '0 8px',
          alignItems: 'center',
          '& .MuiIconButton-root': {
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        '& .MuiAlert-icon': {
          color: 'rgba(255, 255, 255, 0.9)'
        },
        boxShadow: 1,
        '& .MuiAlert-message': {
          fontWeight: 500,
          fontSize: {
            mobile: '0.75rem',
            sm: '0.875rem'
          },
          textAlign: {
            mobile: 'center',
            sm: 'left'
          },
          width: {
            mobile: '100%',
            sm: 'auto'
          }
        }
      }}
      className="alert"
      severity="info"
      onClose={handleClose}>
      <strong>
        {isPayday ? '🎉 TODAY IS PAYDAY 🎉' : `NEXT PAYDAY IS ${formatFullDate(payday)}`}
      </strong>
    </Alert>
  );
};
