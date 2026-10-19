import { useCallback, useState } from 'react';

interface ScrollShade {
  // Scrolled down from the top, so the header should shade what passes under it
  top: boolean;
  // More below, so the footer should shade what's under it
  bottom: boolean;
}

const NONE: ScrollShade = { top: false, bottom: false };

/*
 * Where a scrolling area stands, for the shades on its fixed header and footer. Attach `ref` to the
 * area. It updates on scroll (passively) and whenever the area or its content changes size, so a
 * section opening or a sheet growing is caught too.
 */
export const useScrollShade = () => {
  const [shade, setShade] = useState(NONE);

  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const measure = () => {
      const top = el.scrollTop > 1;
      const bottom = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
      setShade(current =>
        current.top === top && current.bottom === bottom ? current : { top, bottom }
      );
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    // jsdom has no ResizeObserver; there the shades simply stay as first measured
    if (typeof ResizeObserver === 'undefined') {
      return () => el.removeEventListener('scroll', measure);
    }
    const resize = new ResizeObserver(measure);
    const watch = () => {
      resize.observe(el);
      for (const child of el.children) resize.observe(child);
    };
    watch();
    // A step or section added later is watched too
    const added = new MutationObserver(() => {
      watch();
      measure();
    });
    added.observe(el, { childList: true });
    return () => {
      el.removeEventListener('scroll', measure);
      resize.disconnect();
      added.disconnect();
    };
  }, []);

  return { ref, ...shade };
};
