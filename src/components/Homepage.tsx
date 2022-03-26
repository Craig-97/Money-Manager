import { useQuery } from '@apollo/client';
import CircularProgress from '@material-ui/core/CircularProgress';
import isEqual from 'lodash/isEqual';
import { Fragment, useEffect, useState } from 'react';
import { EVENTS } from '../constants';
import { GET_ACCOUNT_QUERY } from '../graphql';
import { AccountData, Mode } from '../interfaces';
import { getAccountData } from '../utils';
import { initialState } from '../state';
import { useAccountContext } from '../state/account-context';
import { Header } from './Header';
import { Notes } from './Notes';
import { Overview } from './Overview';

export const Homepage = () => {
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY);
  const [mode, setMode] = useState<Mode>({ NOTES: false, OVERVIEW: true });
  const {
    state: { account },
    dispatch
  } = useAccountContext();

  useEffect(() => {
    const formattedData = data?.account ? getAccountData(data.account) : initialState.account;

    if (!isEqual(formattedData, account)) {
      dispatch({ type: EVENTS.GET_ACCOUNT_DETAILS, data: formattedData });
    }
    // eslint-disable-next-line
  }, [data, dispatch]);

  const updateMode = () => {
    mode.OVERVIEW
      ? setMode({ OVERVIEW: false, NOTES: true })
      : setMode({ OVERVIEW: true, NOTES: false });
  };

  return (
    <div className="page">
      <Header updateMode={updateMode} mode={mode} />
      <main>
        <div className="container">
          {!error && !loading && <Fragment>{mode.OVERVIEW ? <Overview /> : <Notes />}</Fragment>}
          {loading && (
            <div className="loading">
              <CircularProgress />
            </div>
          )}
          {error && <p className="error">Error fetching account</p>}
        </div>
      </main>
    </div>
  );
};
