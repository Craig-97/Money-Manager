// jest-dom adds custom matchers for asserting on DOM nodes, e.g. toHaveTextContent
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import { useAccountDialogStore } from '~/state/accountDialog';
import { useDebtDialogStore } from '~/state/debtDialog';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DEFAULT_ACCENT, usePrefsStore } from '~/state/prefs';
import { useReminderChooserStore } from '~/state/reminderChooser';
import { useSetupAccountsStore } from '~/state/setupAccounts';
import { installMatchMedia, resetViewport } from './viewport';

// Component tests render the whole app, so give async queries (findBy*, waitFor) more time than
// the 1s default. The first test in a file also waits for its page's code to load, which can take
// several seconds when every file runs at once; the test itself still times out at 15 seconds.
configure({ asyncUtilTimeout: 10000 });

const noop = () => undefined;

installMatchMedia();

// jsdom has no layout engine, so provide the browser APIs Radix expects
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe = noop;
    unobserve = noop;
    disconnect = noop;
  };
}

window.scrollTo = noop;

// Paydays move off bank holidays fetched from gov.uk; tests run without them, offline
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.includes('gov.uk/bank-holidays')) return Promise.resolve(Response.json({}));
  return realFetch(input, init);
};

// Radix Select and menus use pointer capture and scroll the highlighted option into view
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= noop;
Element.prototype.scrollIntoView ??= noop;

// Keep tests independent: storage, the viewport and the document's theme are shared global state
afterEach(() => {
  cleanup();
  // e.g. holdExitAnimations' getComputedStyle
  vi.restoreAllMocks();
  localStorage.clear();
  usePrefsStore.setState({ theme: 'dark', accent: DEFAULT_ACCENT });
  useNoteDialogStore.setState(useNoteDialogStore.getInitialState(), true);
  useAccountDialogStore.setState(useAccountDialogStore.getInitialState(), true);
  useSetupAccountsStore.setState(useSetupAccountsStore.getInitialState(), true);
  usePaymentDialogStore.setState(usePaymentDialogStore.getInitialState(), true);
  useDebtDialogStore.setState(useDebtDialogStore.getInitialState(), true);
  useReminderChooserStore.setState(useReminderChooserStore.getInitialState(), true);
  resetViewport();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.accent;
  document.documentElement.style.removeProperty('--accent');
});
