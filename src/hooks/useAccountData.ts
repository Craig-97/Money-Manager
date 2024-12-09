import { useEffect } from 'react';
import isEqual from 'lodash.isequal';
import { useQuery } from '@apollo/client';
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
  const { loading: userLoading, error: userError } = useQuery<FindUserData>(FIND_USER_QUERY, {
    onCompleted: data => onFindUserCompleted(data),
    onError: handleGQLError,
    skip: !token || Boolean(user.id)
  });

  // Updates context with user id and email returned from local storage token
  const onFindUserCompleted = (response: FindUserData) => {
    const { tokenFindUser } = response;
    if (!userError) dispatch({ type: EVENTS.LOGIN, data: tokenFindUser });
  };

  // Fetches account information once user id is in context
  const { loading, data, error } = useQuery<AccountData>(GET_ACCOUNT_QUERY, {
    variables: { id: user.id },
    skip: !user.id,
    onError: handleGQLError
  });

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
  const accountExists = errorCode === ERRORS.ACCOUNT_NOT_LINKED ? false : true;

  // Combined loading states for UI
  const isLoading = userLoading || loading || (token && !data && accountExists);

  return { data, loading: isLoading, accountExists };
};