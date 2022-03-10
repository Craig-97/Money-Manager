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
        classBaseName="monthly-income"
        title={'MONTHLY INCOME'}
        amount={monthlyIncome}
        onClick={handleClickOpen}
        icon={<LocalAtmIcon style={{ color: green[500], fontSize: 50 }} />}
      />
      {isOpen && <MonthlyIncomePopup isOpen={isOpen} close={closePopup} />}
    </Fragment>
  );
};