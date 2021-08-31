import { Fragment } from 'react';
import { useAccountContext } from '../../state';
import { Divider } from '@material-ui/core';
import { Account } from '../../interfaces';

export const PaymentsDue = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { paymentsDue, paymentsDueTotal }: Account = account;

  return (
    <div className="upcoming-payments">
      {paymentsDue?.map(({ name, amount }: any, index: number) => {
        return (
          <Fragment key={index}>
            <div key={index} className="payment">
              <h5> {name}</h5>
              <p>£{amount.toFixed(2)}</p>
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
  );
};
