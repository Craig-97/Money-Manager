import { useEffect } from 'react';
import isEqual from 'lodash.isequal';
import { useQuery } from '@apollo/client/react';
import { useGQLEffect } from './useGQLEffect';
import { ERRORS, EVENTS } from '~/constants';
import { FIND_USER_QUERY, GET_ACCOUNT_QUERY, getAccountData } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useAccountStore, useUserContext } from '~/state';
import { AccountData, FindUserData } from '~/types';
import { getGQLErrorCode } from '~/utils';

export const useAccountData = () => {
  const { user, dispatch } = useUserContext();
  const { account, setAccount } = useAccountStore();

  const handleGQLError = useErrorHandler();
  const token = localStorage.getItem('token');

  // Context is cleared on page refresh so need to fetch user id and email
  const {
    loading: userLoading,
    error: userError,
    data: userData
  } = useQuery<FindUserData>(FIND_USER_QUERY, {
    skip: !token || Boolean(user.id)
  });

  // Updates context with user id and email returned from local storage token
  const onFindUserSuccess = (response: FindUserData) => {
    const { tokenFindUser } = response;
    dispatch({ type: EVENTS.LOGIN, data: tokenFindUser });
  };

  useGQLEffect({
    data: userData,
    error: userError,
    onError: handleGQLError,
    onSuccess: onFindUserSuccess
  });

  // Fetches account information once user id is in context
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY, {
    variables: { id: user.id },
    skip: !user.id
  });

  useGQLEffect({ data, error, onError: handleGQLError });

  // If any changes are made to GQL cache then account store gets updated
  useEffect(() => {
    const formattedData = getAccountData(data?.account);

    // Only update if we have valid formatted data and it's different from current
    if (!isEqual(formattedData, account)) {
      setAccount(formattedData);
    }
  }, [data, setAccount]);

  // Used to determine If user does not have a linked account
  const errorCode = getGQLErrorCode(error);
  const accountExists = errorCode !== ERRORS.ACCOUNT_NOT_LINKED;

  // Combined loading states for UI
  const isLoading = userLoading || loading || (token && !data && accountExists);

  return { data, loading: isLoading, accountExists };
};
