import { Fragment, useState } from 'react';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import { EnterValuePopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useEditAccount } from '~/hooks';
import { useAccountStore } from '~/state';

export const BankBalanceCard = () => {
  const bankBalance = useAccountStore(s => s.account.bankBalance);
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
        title="BANK BALANCE"
        amount={bankBalance}
        onClick={handleClickOpen}
        icon={<AccountBalanceOutlinedIcon />}
        iconColor="primary"
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
