// jest-dom adds custom matchers for asserting on DOM nodes, e.g. toHaveTextContent
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import { installMatchMedia, resetViewport } from './viewport';

// Component tests render the whole app, so give async queries (findBy*, waitFor) more time
// than the 1s default; they otherwise fail intermittently when test files run in parallel
configure({ asyncUtilTimeout: 5000 });

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

// Keep tests independent: storage, the viewport and the document's theme are shared global state
afterEach(() => {
  cleanup();
  localStorage.clear();
  resetViewport();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.accent;
  document.documentElement.style.removeProperty('--accent');
});
