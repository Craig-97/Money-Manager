import { Fragment, useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { EnterValuePopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';
import { useEditAccount } from '~/hooks';
import { useAccountContext } from '~/state';

export const MonthlyIncomeCard = () => {
  const { account } = useAccountContext();
  const { monthlyIncome } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { updateAccount, loading } = useEditAccount();

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const changeMonthlyIncome = (value: number) => {
    if (!isNaN(value) && value !== monthlyIncome) {
      updateAccount({
        input: { monthlyIncome: value },
        options: { successMessage: 'Monthly Income updated' }
      });
    }
    setIsOpen(false);
  };

  return (
    <Fragment>
      {!loading ? (
        <TotalCard
          classBaseName="monthly-income"
          title="MONTHLY INCOME"
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
