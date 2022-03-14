import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { Fragment, useCallback, useState } from 'react';
import { Account } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
import { AddPaymentsDuePopup } from '../Popups';
import { TotalCard } from './TotalCard';

export const PaymentsDueCard = () => {
  const {
    state: { account }
  } = useAccountContext();

  const { paymentsDueTotal }: Account = account;
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
        classBaseName="payments-due"
        title={'PAYMENTS DUE'}
        amount={paymentsDueTotal}
        onClick={handleClickOpen}
        icon={<AccountBalanceWalletIcon color="secondary" style={{ fontSize: 50 }} />}
      />
      <AddPaymentsDuePopup isOpen={isOpen} close={closePopup} />
    </Fragment>
  );
};