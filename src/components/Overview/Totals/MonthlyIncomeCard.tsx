import { Fragment, useState } from 'react';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { EnterValuePopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useEditAccount } from '~/hooks';
import { useAccountStore } from '~/state';

export const MonthlyIncomeCard = () => {
  const monthlyIncome = useAccountStore(s => s.account.monthlyIncome);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { updateAccount, loading } = useEditAccount();

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const changeMonthlyIncome = async (value: number) => {
    if (!isNaN(value) && value !== monthlyIncome) {
      await updateAccount({
        input: { monthlyIncome: value },
        options: { successMessage: 'Monthly Income updated' }
      });
    }
    setIsOpen(false);
  };

  return (
    <Fragment>
      <TotalCard
        title="MONTHLY INCOME"
        amount={monthlyIncome}
        onClick={handleClickOpen}
        icon={<PaidOutlinedIcon />}
        iconColor="success"
      />
      {isOpen && (
        <EnterValuePopup
          currentValue={monthlyIncome}
          isOpen={isOpen}
          close={() => setIsOpen(false)}
          changeValue={changeMonthlyIncome}
          title="Monthly Income"
          labelText="Enter your updated monthly income"
          loading={loading}
        />
      )}
    </Fragment>
  );
};
