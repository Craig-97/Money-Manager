import { Fragment, useState } from 'react';
import { Divider } from '@mui/material';
import { EditMonthlyBillsPopup, EditPaymentsDuePopup } from '../Popups';
import { PAYMENT_TYPES } from '~/constants';
import { useAccountContext } from '~/state';
import { Bill, OneOffPayment } from '~/types';
import { formatAmount, isNegative } from '~/utils';

interface Modal {
  PAYMENT_DUE: boolean;
  BILL: boolean;
}

export const PaymentsDue = () => {
  const { account } = useAccountContext();
  const { paymentsDue, paymentsDueTotal } = account;
  const [isOpen, setIsOpen] = useState<Modal>({ PAYMENT_DUE: false, BILL: false });
  const [selectedPayment, setSelectedPayment] = useState<OneOffPayment | Bill>({});

  const handleClickOpen = (payment: Bill | OneOffPayment) => {
    setSelectedPayment(payment);

    setIsOpen({
      ...isOpen,
      BILL: payment?.__typename === PAYMENT_TYPES.BILL,
      PAYMENT_DUE: payment?.__typename !== PAYMENT_TYPES.BILL
    });
  };

  const closePopup = () => {
    setIsOpen({ PAYMENT_DUE: false, BILL: false });
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
        close={closePopup}
        selectedBill={selectedPayment as Bill}
      />
      <EditPaymentsDuePopup
        isOpen={isOpen.PAYMENT_DUE}
        close={closePopup}
        selectedPayment={selectedPayment as OneOffPayment}
      />
    </Fragment>
  );
};
