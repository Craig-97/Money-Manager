import { afterEach, describe, expect, it } from 'vitest';
import { getAuthToken, useAuthStore } from './authStore';

const session = (expiresAt: number) => ({ token: 'stored-token', userId: 'user-1', expiresAt });

const restore = async (saved: object) => {
  localStorage.setItem('mm-auth', JSON.stringify({ state: saved, version: 1 }));
  await useAuthStore.persist.rehydrate();
};

afterEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true);
});

describe('auth store', () => {
  it('restores a saved session that is still valid', async () => {
    await restore({ session: session(Date.now() + 60_000) });

    expect(getAuthToken()).toBe('stored-token');
    expect(useAuthStore.getState().endReason).toBeNull();
  });

  it('ends a saved session that expired while the app was closed', async () => {
    await restore({ session: session(Date.now() - 1) });

    expect(getAuthToken()).toBeUndefined();
    expect(useAuthStore.getState().endReason).toBe('expired');
  });

  it('only saves the session, not why the last one ended', () => {
    useAuthStore.getState().startSession(session(Date.now() + 60_000));
    useAuthStore.getState().endSession('signed-out');

    expect(JSON.parse(localStorage.getItem('mm-auth')!).state).toEqual({ session: null });
  });
});
