import { Alert } from '@mui/material';
import { useState } from 'react';
import { formatFullDate, getPayday } from '~/utils';

export const PaydayAlert = () => {
  const { payday, isPayday } = getPayday(new Date());
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return isOpen ? (
    <Alert className="alert" severity="info" onClose={() => setIsOpen(false)}>
      <strong>{isPayday ? `TODAY IS PAYDAY` : `NEXT PAYDAY IS ${formatFullDate(payday)}`}</strong>
    </Alert>
  ) : null;
};
