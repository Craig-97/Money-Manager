// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// Component tests render the whole app, so give async queries (findBy*, waitFor) more time
// than the 1s default; they otherwise fail intermittently when test files run in parallel
configure({ asyncUtilTimeout: 5000 });

const noop = () => undefined;

// jsdom has no layout engine, so provide the browser APIs MUI, react-slick and recharts expect
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false
    }) as MediaQueryList;
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe = noop;
    unobserve = noop;
    disconnect = noop;
  };
}

window.scrollTo = noop;

// Keep tests independent: storage is shared global state
afterEach(() => {
  cleanup();
  localStorage.clear();
});
