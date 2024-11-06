import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Fragment, useState } from 'react';
import { useAccountContext } from '~/state/account-context';
import { EnterValuePopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';
import { useEditAccount } from '~/hooks';

export const BankBalanceCard = () => {
  const { account } = useAccountContext();
  const { bankBalance } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { updateAccount, loading } = useEditAccount();

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const changeBankBalance = (value: number) => {
    if (!isNaN(value) && value !== bankBalance) {
      updateAccount({ bankBalance: value }, { successMessage: 'Bank Total updated' });
    }
    setIsOpen(false);
  };

  return (
    <Fragment>
      {!loading ? (
        <TotalCard
          classBaseName="bank-balance"
          title={'BANK TOTAL'}
          amount={bankBalance}
          onClick={handleClickOpen}
          icon={<AccountBalanceIcon color="primary" />}
        />
      ) : (
        <LoadingCard />
      )}
      {isOpen && (
        <EnterValuePopup
          currentValue={bankBalance}
          isOpen={isOpen}
          close={() => setIsOpen(false)}
          changeValue={changeBankBalance}
          title="Bank Total"
          labelText="Enter your updated bank total"
        />
      )}
    </Fragment>
  );
};
