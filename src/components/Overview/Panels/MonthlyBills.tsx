import { Divider } from '@mui/material';
import { Fragment, useState } from 'react';
import { useAccountContext } from '~/state';
import { Bill } from '~/types';
import { formatAmount, isNegative } from '~/utils';
import { EditMonthlyBillsPopup } from '../Popups';

export const MonthlyBills = () => {
  const { account } = useAccountContext();
  const { bills, billsTotal } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<Bill>({});

  const handleClickOpen = (bill: Bill) => {
    setSelectedBill(bill);
    setIsOpen(true);
  };

  return (
    <Fragment>
      <div className="monthly-bills">
        {bills?.map(({ id, name, amount, paid }: Bill) => {
          return (
            <Fragment key={`${id}-fragment`}>
              <div
                key={id}
                className="bill"
                onClick={() => handleClickOpen({ id, name, amount, paid })}>
                <h5> {name}</h5>
                <p className={`${isNegative(amount) ? 'negative' : 'positive'}`}>
                  {!!isNegative(amount) && `- `}£{formatAmount(amount)}
                </p>
              </div>
              <Divider />
            </Fragment>
          );
        })}
        <div className="total">
          <h3>Total</h3>
          <h3 className={`${isNegative(billsTotal) ? 'negative' : 'positive'}`}>
            {!!isNegative(billsTotal) && `- `}£{formatAmount(billsTotal)}
          </h3>
        </div>
      </div>
      <EditMonthlyBillsPopup
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        selectedBill={selectedBill}
      />
    </Fragment>
  );
};
