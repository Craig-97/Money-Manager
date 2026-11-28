import { useApolloClient } from '@apollo/client/react';
import { LogoutDocument } from '~/graphql/generated';
import { useAuthStore } from '~/state/auth';

/*
 * Ends the session, asks the API to end it too (which clears the refresh cookie), and drops the
 * cached data. The route guards then show sign in.
 */
export const useLogout = () => {
  const client = useApolloClient();
  const endSession = useAuthStore(s => s.endSession);

  return () => {
    // Doesn't wait: the person is signed out here whether or not the API could be reached
    void client.mutate({ mutation: LogoutDocument }).catch(() => undefined);
    endSession('signed-out');
    void client.clearStore();
  };
};
