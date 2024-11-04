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
        sx={{ mb: 4, transform: 'none', bgcolor: 'rgb(7, 19, 24)' }}>
        <Alert severity="info"></Alert>
      </Skeleton>
    );
  }

  return (
    <Alert
      sx={{
        mb: 4,
        alignItems: 'center'
      }}
      className="alert"
      severity="info"
      onClose={handleClose}
      slotProps={{
        closeButton: {
          sx: {
            padding: 0
          }
        }
      }}>
      <strong>{isPayday ? `TODAY IS PAYDAY` : `NEXT PAYDAY IS ${formatFullDate(payday)}`}</strong>
    </Alert>
  );
};
