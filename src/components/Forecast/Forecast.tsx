import { Fragment } from 'react';
import { PaydayBalanceTable } from './PaydayBalanceTable';

export const Forecast = () => (
  <Fragment>
    <h4 className="forecast-header">Forecast</h4>
    <div className="forecast">
      <PaydayBalanceTable past={true} />
      <PaydayBalanceTable />
    </div>
  </Fragment>
);
