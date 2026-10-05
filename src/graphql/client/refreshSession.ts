import { print } from 'graphql';
import { AuthSessionFragment, RefreshSessionDocument } from '~/graphql/generated';
import { apiUrl } from './apiUrl';

// null when the API says there is no session to refresh (no cookie, or it was used or expired)
export type RefreshResult = AuthSessionFragment | null;
export type RefreshFn = () => Promise<RefreshResult>;

let inFlight: Promise<RefreshResult> | null = null;

const request = async (): Promise<RefreshResult> => {
  // A plain fetch rather than Apollo, so a failed refresh can't set off another refresh
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ query: print(RefreshSessionDocument) })
  });
  const body = (await response.json()) as {
    data?: { refreshSession: AuthSessionFragment } | null;
    errors?: { extensions?: { code?: string } }[];
  };

  if (body.data?.refreshSession) return body.data.refreshSession;
  if (body.errors?.some(e => e.extensions?.code === 'UNAUTHENTICATED')) return null;
  // Anything else, such as the API being down, isn't an answer about the session
  throw new Error('Could not refresh the session');
};

/*
 * Swaps the refresh cookie for a new access token. Each refresh token works once, so calls made
 * while one is already running share it rather than racing and signing the person out.
 */
export const refreshSession: RefreshFn = () => {
  inFlight ??= request().finally(() => {
    inFlight = null;
  });
  return inFlight;
};
