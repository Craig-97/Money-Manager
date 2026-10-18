import { vi } from 'vitest';

/*
 * Radix keeps a closing dialog on screen until its exit animation ends. jsdom runs no animations,
 * so it would go at once. This makes every element report an animation that never ends while
 * it's closed, so a test can see what a dialog shows on its way out.
 */
export const holdExitAnimations = () => {
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
    const style = real(element, pseudo);
    return new Proxy(style, {
      get: (target, key) => {
        // Read when asked, as Radix keeps the style and checks it again as the dialog closes
        if (key === 'animationName') {
          return element.getAttribute('data-state') === 'closed' ? 'exit' : 'enter';
        }
        const value = Reflect.get(target, key, target) as unknown;
        return typeof value === 'function' ? value.bind(target) : value;
      }
    });
  });
};
