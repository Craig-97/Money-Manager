import { Fragment, useCallback, useState } from 'react';
import { Divider } from '@material-ui/core';
import { Account, Bill, OneOffPayment } from '../../interfaces';
import { useAccountContext } from '../../state';
import { EditMonthlyBillsPopup, EditPaymentsDuePopup } from '../Popups';
import { TYPES } from '../../constants';

export const PaymentsDue = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { paymentsDue, paymentsDueTotal }: Account = account;
  const [isOpen, setIsOpen] = useState({ PAYMENT_DUE: false, BILL: false });
  const [selectedPayment, setSelectedPayment] = useState<Bill>({});

  const handleClickOpen = (payment: Bill | OneOffPayment) => {
    setSelectedPayment(payment);

    payment?.__typename === TYPES.BILL
      ? setIsOpen({ ...isOpen, BILL: true })
      : setIsOpen({ ...isOpen, PAYMENT_DUE: true });
  };

  const closePopup = useCallback(() => {
    setIsOpen({ PAYMENT_DUE: false, BILL: false });
  }, []);

  return (
    <Fragment>
      <div className="upcoming-payments">
        {paymentsDue?.map(({ id, name, amount, __typename }: Bill | OneOffPayment) => {
          return (
            <Fragment key={`${id}-fragment`}>
              <div
                key={id}
                className="payment"
                onClick={() => handleClickOpen({ id, name, amount, __typename })}>
                <h5> {name}</h5>
                <p>£{amount?.toFixed(2)}</p>
              </div>
              <Divider />
            </Fragment>
          );
        })}
        <div className="payment">
          <h3>Total</h3>
          <p>£{paymentsDueTotal?.toFixed(2)}</p>
        </div>
      </div>
      {isOpen.BILL && (
        <EditMonthlyBillsPopup
          isOpen={isOpen.BILL}
          close={closePopup}
          selectedBill={selectedPayment}
        />
      )}
      {isOpen.PAYMENT_DUE && (
        <EditPaymentsDuePopup
          isOpen={isOpen.PAYMENT_DUE}
          close={closePopup}
          selectedPayment={selectedPayment}
        />
      )}
    </Fragment>
  );
};
