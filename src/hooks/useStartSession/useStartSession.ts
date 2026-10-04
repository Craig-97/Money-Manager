import { useApolloClient } from '@apollo/client/react';
import { AuthSessionFragment, CurrentUserDocument } from '~/graphql/generated';
import { useAuthStore } from '~/state/auth';

const HOUR_MS = 60 * 60 * 1000;

/* Starts a session from what login, register or reset password returned */
export const useStartSession = () => {
  const client = useApolloClient();
  const startSession = useAuthStore(s => s.startSession);

  return ({ token, tokenExpiration, user }: AuthSessionFragment) => {
    // The response already has the user, so the app doesn't need to ask for it again
    client.writeQuery({ query: CurrentUserDocument, data: { tokenFindUser: user } });

    startSession({ token, userId: user.id, expiresAt: Date.now() + tokenExpiration * HOUR_MS });
  };
};
