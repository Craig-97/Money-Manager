import React, { Fragment } from "react";
import { green } from "@material-ui/core/colors";
import { useAccountContext } from "../../state";
import { Divider } from "@material-ui/core";

export const Transactions = () => {
  const [{ account }] = useAccountContext();
  const { transactions } = account;

  return (
    <div className="transactions">
      {transactions?.map(({ name, negative, amount, date }, index) => {
        return (
          <Fragment key={index}>
            <div key={index} className="transaction">
              <div>
                <h4> {name}</h4>
                <h5>{date}</h5>
              </div>

              <p style={{ color: !negative && green[500] }}>
                {negative && `- `}£{amount.toFixed(2)}
              </p>
            </div>
            <Divider />
          </Fragment>
        );
      })}
    </div>
  );
};
