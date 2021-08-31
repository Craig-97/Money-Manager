import { Fragment, useState, useCallback } from 'react';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import { BankBalancePopup } from '../Popup';
import { TotalCard } from './TotalCard';
import { useAccountContext } from '../../state/account-context';
import { Account } from '../../interfaces';

export const BankBalanceCard = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankBalance }: Account = account;
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
        classBaseName="bank-balance"
        title={'BANK TOTAL'}
        amount={bankBalance}
        onClick={handleClickOpen}
        icon={<AccountBalanceIcon color="primary" style={{ fontSize: 50 }} />}
      />
      <BankBalancePopup open={open} setOpen={updateOpen} />
    </Fragment>
  );
};
