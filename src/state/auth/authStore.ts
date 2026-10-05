import { create } from 'zustand';

export interface Session {
  token: string;
  userId: string;
  // Epoch ms when the API stops accepting the token
  expiresAt: number;
}

// Why the last session ended, so the sign-in screen can explain it
export type SessionEndReason = 'expired' | 'signed-out';

interface AuthState {
  session: Session | null;
  endReason: SessionEndReason | null;
  // False until the app has tried to restore a session from the refresh cookie
  restored: boolean;
  startSession: (session: Session) => void;
  endSession: (reason: SessionEndReason) => void;
  // The refresh cookie was tried and nobody is signed in
  finishRestore: () => void;
}

/*
 * The access token only ever lives in memory. A session lasts across reloads through the httpOnly
 * refresh cookie, which scripts can't read, so the app can't tell whether it has one. This flag in
 * localStorage records that this browser signed in, so visitors who never have don't wait on a
 * refresh request. It is not a credential.
 */
const HINT_KEY = 'mm-session';

const hasSessionHint = () => {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
};

const setSessionHint = (signedIn: boolean) => {
  try {
    if (signedIn) localStorage.setItem(HINT_KEY, '1');
    else localStorage.removeItem(HINT_KEY);
  } catch {
    // Storage is blocked; the person just signs in again after a reload
  }
};

export const useAuthStore = create<AuthState>()(set => ({
  session: null,
  endReason: null,
  restored: !hasSessionHint(),
  startSession: session => {
    setSessionHint(true);
    set({ session, endReason: null, restored: true });
  },
  endSession: reason => {
    setSessionHint(false);
    set({ session: null, endReason: reason, restored: true });
  },
  finishRestore: () => set({ restored: true })
}));

/* The current token, for code outside React such as the Apollo auth link */
export const getAuthToken = () => useAuthStore.getState().session?.token;
