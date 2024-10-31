import { Alert } from '@mui/material';
import { useState } from 'react';
import { useGetPayday } from '~/hooks';
import { formatFullDate } from '~/utils';

const PAYDAY_ALERT_CLOSED_KEY = 'paydayAlertClosed';

const getAlertClosedStatus = () => sessionStorage.getItem(PAYDAY_ALERT_CLOSED_KEY) === 'true';
const setAlertClosedStatus = (status: boolean) =>
  sessionStorage.setItem(PAYDAY_ALERT_CLOSED_KEY, status.toString());

export const PaydayAlert = () => {
  const [isOpen, setIsOpen] = useState<boolean>(() => !getAlertClosedStatus());
  const { paydayInfo, error } = useGetPayday();

  const handleClose = () => {
    setIsOpen(false);
    setAlertClosedStatus(true);
  };

  if (!isOpen || error || paydayInfo.payday === null) {
    return null;
  }

  const { payday, isPayday } = paydayInfo;

  return (
    <Alert className="alert" severity="info" onClose={handleClose}>
      <strong>{isPayday ? `TODAY IS PAYDAY` : `NEXT PAYDAY IS ${formatFullDate(payday)}`}</strong>
    </Alert>
  );
};
