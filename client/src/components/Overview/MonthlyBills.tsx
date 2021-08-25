import React, { Fragment } from 'react';
import { useAccountContext } from '../../state';
import { Divider } from '@material-ui/core';
import { Account } from '../../interfaces';

export const MonthlyBills = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { bills, billsTotal }: Account = account;

  return (
    <div className="monthly-bills">
      {bills?.map(({ name, amount }: any, index: number) => {
        return (
          <Fragment key={index}>
            <div className="bill">
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
  );
};
