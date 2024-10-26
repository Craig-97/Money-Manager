import { Alert } from '@mui/material';
import { useState } from 'react';
import { PaydayConfig, PaydayType } from '~/types';
import { formatFullDate, getPayday } from '~/utils';

export const PaydayAlert = () => {
  const config: PaydayConfig = {
    type: PaydayType.SPECIFIC_DATE,
    dayOfMonth: 28
  };
  const { payday, isPayday } = getPayday(new Date(), config);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return isOpen ? (
    <Alert className="alert" severity="info" onClose={() => setIsOpen(false)}>
      <strong>{isPayday ? `TODAY IS PAYDAY` : `NEXT PAYDAY IS ${formatFullDate(payday)}`}</strong>
    </Alert>
  ) : null;
};
