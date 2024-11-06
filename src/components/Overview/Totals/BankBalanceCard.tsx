import { Fragment, useState } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { EnterValuePopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useEditAccount } from '~/hooks';
import { useAccountContext } from '~/state/account-context';

export const BankBalanceCard = () => {
  const { account } = useAccountContext();
  const { bankBalance } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { updateAccount, loading } = useEditAccount();

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const changeBankBalance = async (value: number) => {
    if (!isNaN(value) && value !== bankBalance) {
      await updateAccount({
        input: { bankBalance: value },
        options: { successMessage: 'Bank Balance updated' }
      });
      setIsOpen(false);
    }
  };

  return (
    <Fragment>
      <TotalCard
        classBaseName="bank-balance"
        title="BANK BALANCE"
        amount={bankBalance}
        onClick={handleClickOpen}
        icon={<AccountBalanceIcon color="primary" />}
      />
      {isOpen && (
        <EnterValuePopup
          currentValue={bankBalance}
          isOpen={isOpen}
          close={() => setIsOpen(false)}
          changeValue={changeBankBalance}
          title="Bank Balance"
          labelText="Enter your updated bank balance"
          loading={loading}
        />
      )}
    </Fragment>
  );
};
