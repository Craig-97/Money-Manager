import { Fragment, useCallback, useState } from 'react';
import { Divider } from '@material-ui/core';
import { Account, Bill } from '../../interfaces';
import { useAccountContext } from '../../state';
import { EditMonthlyBillsPopup } from '../Popups';

export const MonthlyBills = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { bills, billsTotal }: Account = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<Bill>({});

  const handleClickOpen = (bill: Bill) => {
    setSelectedBill(bill);
    setIsOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Fragment>
      <div className="monthly-bills">
        {bills?.map(({ id, name, amount, paid }: Bill) => {
          return (
            <Fragment key={`${id}-fragment`}>
              <div
                key={id}
                className="bill"
                onClick={() => handleClickOpen({ id, name, amount, paid })}
              >
                <h5> {name}</h5>
                <p>£{amount?.toFixed(2)}</p>
              </div>
              <Divider />
            </Fragment>
          );
        })}
        <div className="bill">
          <h3>Total</h3>
          <p>£{billsTotal?.toFixed(2)}</p>
        </div>
      </div>
      <EditMonthlyBillsPopup
        isOpen={isOpen}
        close={closePopup}
        selectedBill={selectedBill}
      />
    </Fragment>
  );
};
