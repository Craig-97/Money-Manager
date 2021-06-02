import React, { Fragment } from "react";
import { useAccountContext } from "../../state";
import { Divider } from "@material-ui/core";

export const PaymentsDue = () => {
  const [{ account }] = useAccountContext();
  const { paymentsDue, paymentsDueTotal } = account;

  return (
    <div className="upcoming-payments">
      {paymentsDue?.map(({ name, amount }, index) => {
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
        <p>£{paymentsDueTotal.toFixed(2)}</p>
      </div>
    </div>
  );
};
