import { Fragment, useState, useCallback } from 'react';
import { useAccountContext } from '../../state';
import { EditMonthlyBillsPopup } from '../Popup';
import { Divider } from '@material-ui/core';
import { Account } from '../../interfaces';
import { Bill } from '../../interfaces';

export const MonthlyBills = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { bills, billsTotal }: Account = account;
  const [open, setOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<Bill>({});

  const handleClickOpen = (bill: Bill) => {
    setSelectedBill(bill);
    setOpen(true);
  };

  const updateOpen = useCallback(value => {
    setOpen(value);
  }, []);

  return (
    <Fragment>
      <div className="monthly-bills">
        {bills?.map(({ id, name, amount, paid }: Bill, index: number) => {
          return (
            <Fragment key={index}>
              <div
                className="bill"
                onClick={() => handleClickOpen({ id, name, amount, paid })}
              >
                <h5> {name}</h5>
                <p key={index}>£{amount?.toFixed(2)}</p>
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
        open={open}
        setOpen={updateOpen}
        selectedBill={selectedBill}
      />
    </Fragment>
  );
};
