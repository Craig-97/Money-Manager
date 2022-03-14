import { Fragment, useState, useCallback } from 'react';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import { BankBalancePopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useAccountContext } from '../../state/account-context';
import { Account } from '../../interfaces';

export const BankBalanceCard = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankBalance }: Account = account;
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
        classBaseName="bank-balance"
        title={'BANK TOTAL'}
        amount={bankBalance}
        onClick={handleClickOpen}
        icon={<AccountBalanceIcon color="primary" style={{ fontSize: 50 }} />}
      />
      {isOpen && <BankBalancePopup isOpen={isOpen} close={closePopup} />}
    </Fragment>
  );
};
