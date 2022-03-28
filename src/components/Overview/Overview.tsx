import { Fragment } from 'react';
import { Panels } from './Panels';
import { PaydayAlert } from './PaydayAlert/PaydayAlert';
import { Totals } from './Totals';

export const Overview = () => (
  <Fragment>
    <PaydayAlert />
    <Totals />
    <Panels />
  </Fragment>
);
