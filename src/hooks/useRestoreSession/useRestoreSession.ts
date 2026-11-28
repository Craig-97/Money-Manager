import { useEffect, useEffectEvent } from 'react';
import { refreshSession } from '~/graphql/client';
import { useAuthStore } from '~/state/auth';
import { useStartSession } from '../useStartSession';

/*
 * On load, signs back in with the refresh cookie if this browser had a session. Nothing is shown
 * as signed in or out until it has answered, so a reload doesn't flash the sign in page.
 */
export const useRestoreSession = () => {
  const restored = useAuthStore(s => s.restored);
  const startSession = useStartSession();

  const restore = useEffectEvent(async () => {
    try {
      const result = await refreshSession();
      if (result) startSession(result);
      else useAuthStore.getState().endSession('expired');
    } catch {
      // The API couldn't be reached. Stay signed out for now; the next reload tries again.
      useAuthStore.getState().finishRestore();
    }
  });

  useEffect(() => {
    if (!restored) void restore();
  }, [restored]);
};
