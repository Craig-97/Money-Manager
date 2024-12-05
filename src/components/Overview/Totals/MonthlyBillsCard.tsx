import { Fragment, useState } from 'react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { MonthlyBillsPopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useCreateBill } from '~/hooks';
import { useAccountStore } from '~/state';
import { Bill } from '~/types';

export const MonthlyBillsCard = () => {
  const billsTotal = useAccountStore(s => s.account.billsTotal);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { createNewBill, loading } = useCreateBill(() => setIsOpen(false));

  const handleCreateBill = (bill: Bill) => {
    createNewBill({ bill });
  };

  return (
    <Fragment>
      <TotalCard
        title="MONTHLY BILLS"
        amount={billsTotal}
        onClick={() => setIsOpen(true)}
        icon={<ReceiptLongOutlinedIcon />}
        iconColor="secondary"
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
