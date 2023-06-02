import { useMutation } from '@apollo/client';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { EDIT_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useAccountContext } from '~/state/account-context';
import { MonthlyIncomePopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';

export const MonthlyIncomeCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { monthlyIncome, id } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const [editAccount, { loading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const changeMonthlyIncome = (value: number | undefined) => {
    if (value && value !== monthlyIncome) {
      editAccount({
        variables: { id, account: { monthlyIncome: value } },
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
          classBaseName="monthly-income"
          title={'MONTHLY INCOME'}
          amount={monthlyIncome}
          onClick={handleClickOpen}
          icon={<LocalAtmIcon color="action" />}
        />
      ) : (
        <LoadingCard />
      )}
      {isOpen && (
        <MonthlyIncomePopup
          isOpen={isOpen}
          close={() => setIsOpen(false)}
          changeMonthlyIncome={changeMonthlyIncome}
        />
      )}
    </Fragment>
  );
};
