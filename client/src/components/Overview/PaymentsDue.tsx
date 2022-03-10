import { Fragment, useCallback, useState } from 'react';
import { Divider } from '@material-ui/core';
import { Account, Bill, OneOffPayment } from '../../interfaces';
import { useAccountContext } from '../../state';
import { EditMonthlyBillsPopup } from '../Popups';
import { TYPES } from '../../constants';

export const PaymentsDue = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { paymentsDue, paymentsDueTotal }: Account = account;
  const [billOpen, setBillOpen] = useState<boolean>(false);
  const [paymentOpen, setPaymentOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Bill>({});

  const handleClickOpen = (payment: Bill | OneOffPayment) => {
    setSelectedPayment(payment);

    payment?.__typename === TYPES.BILL
      ? setBillOpen(true)
      : setPaymentOpen(true);
  };

  const updateBillOpen = useCallback(value => {
    setBillOpen(value);
  }, []);

  const updatePaymentOpen = useCallback(value => {
    setPaymentOpen(value);
  }, []);

  return (
    <Fragment>
      <div className="upcoming-payments">
        {paymentsDue?.map(
          ({ id, name, amount, __typename }: Bill | OneOffPayment) => {
            return (
              <Fragment key={`${id}-fragment`}>
                <div
                  key={id}
                  className="payment"
                  onClick={() =>
                    handleClickOpen({ id, name, amount, __typename })
                  }
                >
                  <h5> {name}</h5>
                  <p>£{amount?.toFixed(2)}</p>
                </div>
                <Divider />
              </Fragment>
            );
          }
        )}
        <div className="payment">
          <h3>Total</h3>
          <p>£{paymentsDueTotal?.toFixed(2)}</p>
        </div>
      </div>
      <EditMonthlyBillsPopup
        open={billOpen}
        setOpen={updateBillOpen}
        selectedBill={selectedPayment}
      />
    </Fragment>
  );
};
