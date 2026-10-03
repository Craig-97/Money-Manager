import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  startSession: (session: Session) => void;
  endSession: (reason: SessionEndReason) => void;
}

const isExpired = (session: Session | null) => !!session && session.expiresAt <= Date.now();

// TODO(phase 4): the token moves to memory with an httpOnly refresh cookie; until the API
// supports that, it is kept in localStorage like the previous app did.
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      session: null,
      endReason: null,
      startSession: session => set({ session, endReason: null }),
      endSession: reason => set({ session: null, endReason: reason })
    }),
    {
      name: 'mm-auth',
      version: 1,
      partialize: state => ({ session: state.session }),
      // A token that expired while the app was closed ends the session straight away
      onRehydrateStorage: () => state => {
        if (state && isExpired(state.session)) state.endSession('expired');
      }
    }
  )
);

/* The current token, for code outside React such as the Apollo auth link */
export const getAuthToken = () => useAuthStore.getState().session?.token;
