import { useMutation } from '@apollo/client';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Fragment, useCallback, useState } from 'react';
import { editAccountCache, EDIT_ACCOUNT_MUTATION } from '../../../graphql';
import { Account } from '../../../types';
import { useAccountContext } from '../../../state/account-context';
import { MonthlyIncomePopup } from '../../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';

export const MonthlyIncomeCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { monthlyIncome, id }: Account = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editAccount, { loading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

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
        ) => editAccountCache(cache, account, user)
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
          close={closePopup}
          changeMonthlyIncome={changeMonthlyIncome}
        />
      )}
    </Fragment>
  );
};
