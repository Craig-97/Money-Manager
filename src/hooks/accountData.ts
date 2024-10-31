import { useQuery } from '@apollo/client';
import isEqual from 'lodash/isEqual';
import { useEffect } from 'react';
import { FIND_USER_QUERY, GET_ACCOUNT_QUERY } from '~/graphql';
import { initialState } from '~/state';
import { useAccountContext } from '~/state/account-context';
import { AccountData, FindUserData } from '~/types';
import { getAccountData } from '~/utils';
import { useErrorHandler } from '~/hooks';
import { ERRORS, EVENTS } from '~/constants';

export const useAccountData = () => {
  const {
    state: { account, user },
    dispatch
  } = useAccountContext();

  const handleGQLError = useErrorHandler();
  const token = localStorage.getItem('token');

  // Context is cleared on page refresh so need to fetch user id and email
  const { loading: userLoading, error: userError } = useQuery<FindUserData>(FIND_USER_QUERY, {
    onCompleted: data => onFindUserCompleted(data),
    onError: handleGQLError,
    skip: !token || Boolean(user.id)
  });

  // Updates context with user id and email returned from local storage token
  const onFindUserCompleted = (response: FindUserData) => {
    const { tokenFindUser } = response;
    if (!userError) dispatch({ type: EVENTS.LOGIN, data: { ...tokenFindUser } });
  };

  // Fetches account information once user id is in context
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY, {
    variables: { id: user.id },
    skip: !user.id,
    onError: handleGQLError
  });

  // If any changes are made to GQL cache then context account data gets updated
  useEffect(() => {
    const formattedData = data?.account ? getAccountData(data.account) : initialState.account;

    if (!isEqual(formattedData, account)) {
      dispatch({ type: EVENTS.GET_ACCOUNT_DETAILS, data: formattedData });
    }
    // eslint-disable-next-line
  }, [data, dispatch]);

  // Used to determine If user does not have a linked account
  const accountExists = error?.message === ERRORS.ACCOUNT_NOT_FOUND ? false : true;

  // Combined loading states for UI
  const isLoading = userLoading || loading || (token && !data && accountExists);

  return { data, loading: isLoading, accountExists };
};