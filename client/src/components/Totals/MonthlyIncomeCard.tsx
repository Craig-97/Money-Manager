import { Fragment, useState, useCallback } from 'react';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import { useAccountContext } from '../../state/account-context';
import { MonthlyIncomePopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { green } from '@material-ui/core/colors';
import { Account } from '../../interfaces';

export const MonthlyIncomeCard = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { monthlyIncome }: Account = account;
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
        classBaseName="monthly-income"
        title={'MONTHLY INCOME'}
        amount={monthlyIncome}
        onClick={handleClickOpen}
        icon={<LocalAtmIcon style={{ color: green[500], fontSize: 50 }} />}
      />
      <MonthlyIncomePopup open={open} setOpen={updateOpen} />
    </Fragment>
  );
};
