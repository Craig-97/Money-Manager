import { act, renderHook } from '@testing-library/react';
import { useScrollShade } from './useScrollShade';

/* A scrolling area of a given size, its content and how far it's scrolled */
const area = ({ height, content }: { height: number; content: number }) => {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientHeight', { value: height });
  Object.defineProperty(el, 'scrollHeight', { value: content });
  el.scrollTop = 0;
  return el;
};

const scrollTo = (el: HTMLElement, top: number) =>
  act(() => {
    el.scrollTop = top;
    el.dispatchEvent(new Event('scroll'));
  });

describe('useScrollShade', () => {
  it('shades nothing when there is nothing to scroll', () => {
    const { result } = renderHook(() => useScrollShade());
    act(() => {
      result.current.ref(area({ height: 400, content: 400 }));
    });
    expect(result.current).toMatchObject({ top: false, bottom: false });
  });

  it('shades the footer while there is more below, and the header once scrolled', () => {
    const { result } = renderHook(() => useScrollShade());
    const el = area({ height: 400, content: 1000 });
    act(() => {
      result.current.ref(el);
    });
    expect(result.current).toMatchObject({ top: false, bottom: true });

    scrollTo(el, 300);
    expect(result.current).toMatchObject({ top: true, bottom: true });

    scrollTo(el, 600);
    expect(result.current).toMatchObject({ top: true, bottom: false });
  });
});
