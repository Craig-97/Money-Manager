import { Fragment } from 'react';
import { green } from '@material-ui/core/colors';
import { useAccountContext } from '../../../state';
import { Divider } from '@material-ui/core';
import { Account } from '../../../interfaces';

export const Transactions = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { transactions }: Account = account;

  return (
    <div className="transactions">
      {transactions?.map(({ name, negative, amount, date }: any, index: number) => {
        return (
          <Fragment key={index}>
            <div key={index} className="transaction">
              <div>
                <h4> {name}</h4>
                <h5>{date}</h5>
              </div>

              <p style={{ color: !negative ? green[500] : 'white' }}>
                {negative && `- `}£{amount?.toFixed(2)}
              </p>
            </div>
            <Divider />
          </Fragment>
        );
      })}
    </div>
  );
};
