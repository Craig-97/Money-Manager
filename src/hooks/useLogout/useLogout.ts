import { useApolloClient } from '@apollo/client/react';
import { useAuthStore } from '~/state/auth';

/* Ends the session and drops the cached data. The route guards then show sign in. */
export const useLogout = () => {
  const client = useApolloClient();
  const endSession = useAuthStore(state => state.endSession);

  return () => {
    endSession('signed-out');
    void client.clearStore();
  };
};
