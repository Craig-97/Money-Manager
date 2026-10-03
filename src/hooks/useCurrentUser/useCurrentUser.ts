import { skipToken, useQuery } from '@apollo/client/react';
import { CurrentUserDocument } from '~/graphql/generated';
import { useAuthStore } from '~/state/auth';

/* The signed-in user. Also confirms the stored token is still accepted by the API. */
export const useCurrentUser = () => {
  const hasSession = useAuthStore(s => s.session !== null);
  const { data, loading, error, refetch } = useQuery(
    CurrentUserDocument,
    hasSession ? {} : skipToken
  );

  return { user: data?.tokenFindUser ?? null, loading, error, refetch };
};
