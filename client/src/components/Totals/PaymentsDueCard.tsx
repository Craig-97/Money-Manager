import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { Fragment, useCallback, useState } from 'react';
import { Account } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
import { AddPaymentsDuePopup } from '../Popup';
import { TotalCard } from './TotalCard';

export const PaymentsDueCard = () => {
  const {
    state: { account }
  } = useAccountContext();

  const { paymentsDueTotal }: Account = account;
  const [open, setOpen] = useState<boolean>(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const updateOpen = useCallback(value => {
    setOpen(value);
  }, []);

  return (
    <Fragment>
      <TotalCard
        classBaseName="payments-due"
        title={'PAYMENTS DUE'}
        amount={paymentsDueTotal}
        onClick={handleClickOpen}
        icon={
          <AccountBalanceWalletIcon
            color="secondary"
            style={{ fontSize: 50 }}
          />
        }
      />
      <AddPaymentsDuePopup open={open} setOpen={updateOpen} />
    </Fragment>
  );
};
