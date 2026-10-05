import { afterEach, describe, expect, it } from 'vitest';
import { getAuthToken, useAuthStore } from './authStore';

const session = { token: 'token', userId: 'user-1', expiresAt: Date.now() + 60_000 };

afterEach(() => {
  localStorage.clear();
  useAuthStore.setState(useAuthStore.getInitialState(), true);
});

describe('auth store', () => {
  it('keeps the token in memory only', () => {
    useAuthStore.getState().startSession(session);

    expect(getAuthToken()).toBe('token');
    expect(JSON.stringify({ ...localStorage })).not.toContain('token');
  });

  it('remembers that this browser signed in, so a reload knows to restore the session', () => {
    useAuthStore.getState().startSession(session);
    expect(localStorage.getItem('mm-session')).toBe('1');

    useAuthStore.getState().endSession('signed-out');
    expect(localStorage.getItem('mm-session')).toBeNull();
    expect(useAuthStore.getState()).toMatchObject({ session: null, endReason: 'signed-out' });
  });

  it('has nothing to restore in a browser that never signed in', () => {
    expect(useAuthStore.getInitialState().restored).toBe(true);
  });

  it('waits for the refresh cookie in a browser that signed in before', async () => {
    localStorage.setItem('mm-session', '1');
    useAuthStore.setState({ restored: false });

    useAuthStore.getState().finishRestore();
    expect(useAuthStore.getState().restored).toBe(true);
  });
});
