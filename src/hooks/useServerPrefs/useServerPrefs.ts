import { useEffect, useEffectEvent } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { ThemePreference as ApiTheme, UpdatePreferencesDocument } from '~/graphql/generated';
import { DEFAULT_ACCENT, ThemePreference, usePrefsStore } from '~/state/prefs';
import { useCurrentUser } from '../useCurrentUser';

const toApiTheme = (theme: ThemePreference) => theme.toUpperCase() as ApiTheme;
const fromApiTheme = (theme: ApiTheme) => theme.toLowerCase() as ThemePreference;

/*
 * Keeps the theme and accent in step with the ones saved on the user, so they follow the person
 * to other devices. The local copy stays what the app reads, so there is no flash while the user
 * loads. When the user first loads, what they saved wins; anything they haven't saved yet is
 * filled in from this device if they had changed it. After that, each change is saved.
 */
export const useServerPrefs = () => {
  const client = useApolloClient();
  const { user } = useCurrentUser();
  const userId = user?.id;

  const save = useEffectEvent(
    (variables: { theme?: ApiTheme; accent?: string }) =>
      // Not worth interrupting anyone for: the choice still applies on this device
      void client.mutate({ mutation: UpdatePreferencesDocument, variables }).catch(() => undefined)
  );

  // Reads the user as it was when they first loaded, not as the cache changes after each save
  const sync = useEffectEvent(() => {
    if (!user) return;
    const { theme, accent, setTheme, setAccent } = usePrefsStore.getState();

    if (user.theme) setTheme(fromApiTheme(user.theme));
    if (user.accent) setAccent(user.accent);

    const missing = {
      ...(!user.theme && theme !== 'dark' ? { theme: toApiTheme(theme) } : {}),
      ...(!user.accent && accent !== DEFAULT_ACCENT ? { accent } : {})
    };
    if (missing.theme || missing.accent) save(missing);
  });

  useEffect(() => {
    if (!userId) return;
    sync();

    return usePrefsStore.subscribe((state, previous) => {
      const theme = state.theme !== previous.theme ? toApiTheme(state.theme) : undefined;
      const accent = state.accent !== previous.accent ? state.accent : undefined;
      if (theme || accent) save({ theme, accent });
    });
  }, [userId]);
};
