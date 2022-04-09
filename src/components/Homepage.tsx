import { useQuery } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import isEqual from 'lodash/isEqual';
import { Fragment, useEffect, useState } from 'react';
import { EVENTS, MODES } from '../constants';
import { GET_ACCOUNT_QUERY } from '../graphql';
import { AccountData, Mode } from '../types';
import { initialState } from '../state';
import { useAccountContext } from '../state/account-context';
import { getAccountData } from '../utils';
import { Forecast } from './Forecast';
import { Header } from './Header';
import { Notes } from './Notes';
import { Overview } from './Overview';

export const Homepage = () => {
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY);
  const [mode, setMode] = useState<Mode>({ NOTES: false, FORECAST: false, OVERVIEW: true });
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

  const updateMode = (mode: string) => {
    mode === MODES.OVERVIEW && setMode({ OVERVIEW: true, FORECAST: false, NOTES: false });
    mode === MODES.NOTES && setMode({ OVERVIEW: false, FORECAST: false, NOTES: true });
    mode === MODES.FORECAST && setMode({ OVERVIEW: false, FORECAST: true, NOTES: false });
  };

  return (
    <div className="page">
      <Header updateMode={updateMode} mode={mode} />
      <main>
        <div className="container">
          {!error && !loading && (
            <Fragment>
              {mode.OVERVIEW && <Overview />}
              {mode.NOTES && <Notes />}
              {mode.FORECAST && <Forecast />}
            </Fragment>
          )}
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
