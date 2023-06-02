import { useMutation } from '@apollo/client';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { EDIT_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useAccountContext } from '~/state/account-context';
import { BankBalancePopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';

export const BankBalanceCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { bankBalance, id } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const [editAccount, { loading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const handleClickOpen = () => {
    setIsOpen(true);
  };

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
        ) => editAccountCache(cache, account, user),
        onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
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
          close={() => setIsOpen(false)}
          changeBankBalance={changeBankBalance}
        />
      )}
    </Fragment>
  );
};
