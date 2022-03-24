import { Divider } from '@material-ui/core';
import { Fragment, useCallback, useState } from 'react';
import { TYPES } from '../../../constants';
import { Account, Bill, Modal, OneOffPayment } from '../../../interfaces';
import { useAccountContext } from '../../../state';
import { formatAmount, isNegative } from '../../../utils';
import { EditMonthlyBillsPopup, EditPaymentsDuePopup } from '../../Popups';

export const PaymentsDue = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { paymentsDue, paymentsDueTotal }: Account = account;
  const [isOpen, setIsOpen] = useState<Modal>({ PAYMENT_DUE: false, BILL: false });
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
          <h3 className={`${isNegative(paymentsDueTotal) ? 'negative' : 'positive'}`}>
            {!!isNegative(paymentsDueTotal) && `- `}£{formatAmount(paymentsDueTotal)}
          </h3>
        </div>
      </div>
      <EditMonthlyBillsPopup
        isOpen={isOpen.BILL}
        close={closePopup}
        selectedBill={selectedPayment}
      />
      <EditPaymentsDuePopup
        isOpen={isOpen.PAYMENT_DUE}
        close={closePopup}
        selectedPayment={selectedPayment}
      />
    </Fragment>
  );
};
