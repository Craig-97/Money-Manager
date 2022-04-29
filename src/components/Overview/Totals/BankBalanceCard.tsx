import { useMutation } from '@apollo/client';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Fragment, useCallback, useState } from 'react';
import { editAccountCache, EDIT_ACCOUNT_MUTATION } from '../../../graphql';
import { Account } from '../../../types';
import { useAccountContext } from '../../../state/account-context';
import { BankBalancePopup } from '../../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';

export const BankBalanceCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { bankBalance, id }: Account = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editAccount, { loading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const changeBankBalance = (value: number | undefined) => {
    if (value && value !== bankBalance) {
      editAccount({
        variables: { id, account: { bankBalance: value } },
        update: (
          cache,
          {
            data: {
              editAccount: { account }
            }
          }
        ) => editAccountCache(cache, account, user)
      });
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
        <BankBalancePopup
          isOpen={isOpen}
          close={closePopup}
          changeBankBalance={changeBankBalance}
        />
      )}
    </Fragment>
  );
};
