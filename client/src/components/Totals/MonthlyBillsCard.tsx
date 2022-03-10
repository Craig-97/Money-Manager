import ReceiptIcon from '@material-ui/icons/Receipt';
import { Fragment, useCallback, useState } from 'react';
import { Account } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
import { AddMonthlyBillsPopup } from '../Popups';
import { TotalCard } from './TotalCard';

export const MonthlyBillsCard = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { billsTotal }: Account = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Fragment>
      <TotalCard
        classBaseName="monthly-bills"
        title={'MONTHLY BILLS'}
        amount={billsTotal}
        onClick={handleClickOpen}
        icon={<ReceiptIcon color="secondary" style={{ fontSize: 50 }} />}
      />
      <AddMonthlyBillsPopup isOpen={isOpen} close={closePopup} />
    </Fragment>
  );
};
