import { Fragment, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Divider } from '@mui/material';
import { EditMonthlyBillsPopup, EditPaymentsDuePopup } from '../Popups';
import { PAYMENT_TYPENAME } from '~/constants';
import { useAccountStore } from '~/state';
import { Bill, OneOffPayment } from '~/types';
import { formatAmount, isNegative } from '~/utils';

interface Modal {
  PAYMENT_DUE: boolean;
  BILL: boolean;
}

export const PaymentsDue = () => {
  const [isOpen, setIsOpen] = useState<Modal>({ PAYMENT_DUE: false, BILL: false });
  const [selectedPayment, setSelectedPayment] = useState<OneOffPayment | Bill>({});

  const [paymentsDue, paymentsDueTotal] = useAccountStore(
    useShallow(s => [s.account.paymentsDue, s.account.paymentsDueTotal])
  );

  const handleClickOpen = (payment: Bill | OneOffPayment) => {
    setSelectedPayment(payment);

    setIsOpen({
      ...isOpen,
      BILL: payment?.__typename === PAYMENT_TYPENAME.BILL,
      PAYMENT_DUE: payment?.__typename !== PAYMENT_TYPENAME.BILL
    });
  };

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
        close={() => setIsOpen({ PAYMENT_DUE: false, BILL: false })}
        selectedBill={selectedPayment as Bill}
      />
      <EditPaymentsDuePopup
        isOpen={isOpen.PAYMENT_DUE}
        close={() => setIsOpen({ PAYMENT_DUE: false, BILL: false })}
        selectedPayment={selectedPayment as OneOffPayment}
      />
    </Fragment>
  );
};
