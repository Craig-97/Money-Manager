import { Fragment } from 'react';
import { Panels } from './Panels';
import { Totals } from './Totals';

export const Overview = () => (
  <Fragment>
    <Totals />
    <Panels />
  </Fragment>
);
