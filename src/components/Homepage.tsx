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
import { getAccountData } from '../mockData';
import { initialState } from '../state';

export const Homepage = () => {
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY);
  const {
    state: { account },
    dispatch
  } = useAccountContext();

  console.log('HOMEPAGE RENDERED');

  useEffect(() => {
    const formattedData = data?.account ? getAccountData(data.account) : initialState.account;

    console.log('!isEqual(data, account)', !isEqual(formattedData, account));
    console.log('formattedData', formattedData);
    console.log('CONTEXT ACCOUNT', account);

    if (!isEqual(formattedData, account)) {
      dispatch({ type: EVENTS.GET_ACCOUNT_DETAILS, data: formattedData });
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
