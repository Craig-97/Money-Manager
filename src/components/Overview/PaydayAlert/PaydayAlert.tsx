import { Alert } from '@mui/material';
import { useState } from 'react';
import { useGetPayday } from '~/hooks';
import { formatFullDate } from '~/utils';

export const PaydayAlert = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { paydayInfo, error } = useGetPayday();

  if (!isOpen || error || paydayInfo.payday === null) {
    return null;
  }

  const { payday, isPayday } = paydayInfo;

  return (
    <Alert className="alert" severity="info" onClose={() => setIsOpen(false)}>
      <strong>{isPayday ? `TODAY IS PAYDAY` : `NEXT PAYDAY IS ${formatFullDate(payday)}`}</strong>
    </Alert>
  );
};
