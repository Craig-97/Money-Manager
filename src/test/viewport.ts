// jsdom has no layout engine or matchMedia. This stands in for it, answering min-width / max-width
// queries against a viewport width that tests can change.

const DEFAULT_WIDTH = 1440;
const REM = 16;

let viewportWidth = DEFAULT_WIDTH;
const lists = new Set<{ query: string; matches: boolean; notify: () => void }>();

const toPx = (value: string, unit: string) => Number(value) * (unit === 'rem' ? REM : 1);

const evaluate = (query: string) => {
  const min = /min-width:\s*([\d.]+)(px|rem)/.exec(query);
  const max = /max-width:\s*([\d.]+)(px|rem)/.exec(query);
  if (min && viewportWidth < toPx(min[1], min[2])) return false;
  if (max && viewportWidth > toPx(max[1], max[2])) return false;
  return Boolean(min || max);
};

export const installMatchMedia = () => {
  window.matchMedia = (query: string) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const entry = {
      query,
      matches: evaluate(query),
      notify: () => {
        const matches = evaluate(query);
        if (matches === entry.matches) return;
        entry.matches = matches;
        listeners.forEach(listener => listener({ matches, media: query } as MediaQueryListEvent));
      }
    };
    lists.add(entry);

    return {
      get matches() {
        return evaluate(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    } as MediaQueryList;
  };
};

/* Changes the viewport width seen by media queries and tells their listeners */
export const setViewportWidth = (width: number) => {
  viewportWidth = width;
  lists.forEach(entry => entry.notify());
};

export const resetViewport = () => {
  viewportWidth = DEFAULT_WIDTH;
  lists.clear();
};
