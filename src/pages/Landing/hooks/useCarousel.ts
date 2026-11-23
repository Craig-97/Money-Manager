import { PointerEvent, useEffect, useRef, useState } from 'react';

interface Drag {
  x: number;
  left: number;
  id: number;
  moved: boolean;
}

// How far the mouse moves before a press becomes a drag, so a click is still a click
const DRAG_START = 5;

/*
 * A row of cards that scrolls sideways: ‹ and › move a card at a time and stop at the ends, and a
 * mouse can drag the row, which settles on the nearest card. Touch and trackpads scroll natively,
 * with the row's scroll snapping.
 */
export const useCarousel = <T extends HTMLElement>() => {
  const trackRef = useRef<T>(null);
  const drag = useRef<Drag | null>(null);
  const [ends, setEnds] = useState({ atStart: true, atEnd: false });

  const updateEnds = () => {
    const el = trackRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setEnds(current =>
      current.atStart === atStart && current.atEnd === atEnd ? current : { atStart, atEnd }
    );
  };

  // The ends depend on the row's width, so they're measured once it's laid out and on resize
  useEffect(() => {
    updateEnds();
    window.addEventListener('resize', updateEnds);
    return () => window.removeEventListener('resize', updateEnds);
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    const [first, second] = el ? Array.from(el.children) : [];
    if (!(first instanceof HTMLElement) || !(second instanceof HTMLElement)) return;
    el!.scrollBy({ left: direction * (second.offsetLeft - first.offsetLeft), behavior: 'smooth' });
  };

  const onPointerDown = (event: PointerEvent<T>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = {
      x: event.clientX,
      left: event.currentTarget.scrollLeft,
      id: event.pointerId,
      moved: false
    };
  };

  const onPointerMove = (event: PointerEvent<T>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    const el = event.currentTarget;
    const dx = event.clientX - current.x;
    if (!current.moved) {
      if (Math.abs(dx) < DRAG_START) return;
      current.moved = true;
      el.setPointerCapture(event.pointerId);
      // Snapping and smooth scrolling would fight the drag
      el.style.scrollSnapType = 'none';
      el.style.scrollBehavior = 'auto';
      el.style.cursor = 'grabbing';
    }
    el.scrollLeft = current.left - dx;
  };

  const onPointerUp = (event: PointerEvent<T>) => {
    const current = drag.current;
    drag.current = null;
    if (!current?.moved) return;
    const el = event.currentTarget;
    if (el.hasPointerCapture(current.id)) el.releasePointerCapture(current.id);
    const cards = Array.from(el.children).filter(child => child instanceof HTMLElement);
    const offset = cards[0]?.offsetLeft ?? 0;
    const nearest = cards
      .map(card => card.offsetLeft - offset)
      .reduce(
        (best, left) =>
          Math.abs(left - el.scrollLeft) < Math.abs(best - el.scrollLeft) ? left : best,
        0
      );
    el.style.scrollBehavior = '';
    el.style.cursor = '';
    el.scrollTo({ left: Math.min(nearest, el.scrollWidth - el.clientWidth), behavior: 'smooth' });
    // Once it has settled, snapping takes over again
    window.setTimeout(() => {
      el.style.scrollSnapType = '';
    }, 450);
  };

  return {
    trackRef,
    ...ends,
    previous: () => scrollByCard(-1),
    next: () => scrollByCard(1),
    trackProps: {
      onScroll: updateEnds,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp
    }
  };
};
