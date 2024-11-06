import { Fragment, useState } from 'react';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { MonthlyBillsPopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useCreateBill } from '~/hooks';
import { useAccountContext } from '~/state';
import { Bill } from '~/types';

export const MonthlyBillsCard = () => {
  const { account, user } = useAccountContext();
  const { billsTotal } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { createNewBill, loading } = useCreateBill(() => setIsOpen(false));

  const handleCreateBill = (bill: Bill) => {
    createNewBill({ bill, user });
  };

  return (
    <Fragment>
      <TotalCard
        classBaseName="monthly-bills"
        title="MONTHLY BILLS"
        amount={billsTotal}
        onClick={() => setIsOpen(true)}
        icon={<ReceiptIcon color="secondary" />}
      />
      <MonthlyBillsPopup
        title="Add Monthly Bill"
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        onSave={handleCreateBill}
        loading={loading}
      />
    </Fragment>
  );
};
