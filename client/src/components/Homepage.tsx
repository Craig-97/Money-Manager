import { Fragment, useEffect } from 'react';
import { AccountData } from '../interfaces';
import { useAccountContext } from '../state/account-context';
import { useQuery } from '@apollo/client';
import CircularProgress from '@material-ui/core/CircularProgress';
import isEqual from 'lodash/isEqual';
import { EVENTS } from '../constants';
import { Overview } from './Overview';
import { Totals } from './Totals';
import { GET_ACCOUNT_QUERY } from '../graphql';

export const Homepage = () => {
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY);
  const {
    state: { account },
    dispatch
  } = useAccountContext();

  useEffect(() => {
    if (!isEqual(data, account)) {
      dispatch({ type: EVENTS.GET_ACCOUNT_DETAILS, data });
    }
    // eslint-disable-next-line
  }, [data, dispatch]);

  return (
    <div>
      <div className="header">
        <h1>Money Manager</h1>
      </div>
      <div className="app-container">
        {!error && !loading && (
          <Fragment>
            <Totals />
            <Overview />
          </Fragment>
        )}
        {loading && (
          <div className="loading">
            <CircularProgress />
          </div>
        )}
        {error && <p className="error">Error fetching account data</p>}
      </div>
    </div>
  );
};
