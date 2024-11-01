import { Alert, Skeleton } from '@mui/material';
import { useState } from 'react';
import { useGetPayday } from '~/hooks';
import { formatFullDate } from '~/utils';

const PAYDAY_ALERT_CLOSED_KEY = 'paydayAlertClosed';

const getAlertClosedStatus = () => sessionStorage.getItem(PAYDAY_ALERT_CLOSED_KEY) === 'true';
const setAlertClosedStatus = (status: boolean) =>
  sessionStorage.setItem(PAYDAY_ALERT_CLOSED_KEY, status.toString());

export const PaydayAlert = () => {
  const [isOpen, setIsOpen] = useState<boolean>(() => !getAlertClosedStatus());
  const { paydayInfo, loading, error } = useGetPayday();

  const handleClose = () => {
    setIsOpen(false);
    setAlertClosedStatus(true);
  };

  if (!isOpen || error) {
    return null;
  }

  if (loading || paydayInfo.payday === null) {
    return (
      <Skeleton
        width="100%"
        height={48}
        sx={{ m: '0 0 2rem 0', transform: 'none', bgcolor: 'rgb(7, 19, 24)' }}>
        <Alert severity="info"></Alert>
      </Skeleton>
    );
  }

  const { payday, isPayday } = paydayInfo;

  return (
    <Alert className="alert" severity="info" onClose={handleClose}>
      <strong>{isPayday ? `TODAY IS PAYDAY` : `NEXT PAYDAY IS ${formatFullDate(payday)}`}</strong>
    </Alert>
  );
};
