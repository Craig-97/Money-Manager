import { useMutation } from '@apollo/client';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { EDIT_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useAccountContext } from '~/state/account-context';
import { EnterValuePopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';
import { useErrorHandler } from '~/hooks';

export const MonthlyIncomeCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { monthlyIncome, id } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [editAccount, { loading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const changeMonthlyIncome = (value: number) => {
    if (!isNaN(value) && value !== monthlyIncome) {
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
        onCompleted: () => enqueueSnackbar('Monthly Income updated', { variant: 'success' }),
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
        <EnterValuePopup
          currentValue={monthlyIncome}
          isOpen={isOpen}
          close={() => setIsOpen(false)}
          changeValue={changeMonthlyIncome}
          title="Monthly Income"
          labelText="Enter your updated monthly income"
        />
      )}
    </Fragment>
  );
};
