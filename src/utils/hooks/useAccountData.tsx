import { useQuery } from '@apollo/client';
import isEqual from 'lodash/isEqual';
import { useEffect } from 'react';
import { EVENTS } from '../../constants';
import { GET_ACCOUNT_QUERY } from '../../graphql';
import { initialState } from '../../state';
import { useAccountContext } from '../../state/account-context';
import { AccountData } from '../../types';
import { getAccountData } from '../../utils';

export const useAccountData = () => {
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY);
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

  return { loading, data, error };
};
