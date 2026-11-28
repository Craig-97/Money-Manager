import { RefObject, useEffect, useState } from 'react';
import { Area, Box, cardPosition, chooseSide, scrollToFit, Side, unionOf } from '../placement';
import { TourStep, TourTarget } from '../tourSteps';

// Where something sits on screen, and how round its corners are, clockwise from the top left
export interface Shape extends Box {
  corners: [number, number, number, number];
}

interface TourLayout {
  // Shown through the dim, exactly as big as they are
  lit: Shape[];
  // Outlined in the accent
  outline: Shape | null;
  // Where the card goes; null until it's been worked out, and the card stays see-through till then
  card: { top: number; left: number } | null;
}

const EMPTY: TourLayout = { lit: [], outline: null, card: null };
const DESKTOP_SIDES = ['right', 'left', 'bottom', 'top'] as const;
// The mobile nav and the fade above it, which nothing should sit behind
const MOBILE_NAV = 104;
// Frames to wait for a target to be drawn, e.g. while the dashboard loads. After that the card
// goes in the corner, so the tour carries on.
const MAX_WAIT = 120;
const NOWHERE: Box = { top: 0, left: 0, width: 0, height: 0 };

const elementsOf = (target: TourTarget) =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`)).filter(
    element => element.offsetWidth > 0 && element.offsetHeight > 0
  );

const boxOf = (target: TourTarget | undefined) => {
  if (!target) return null;
  return unionOf(
    elementsOf(target).map(element => {
      const { top, left, width, height } = element.getBoundingClientRect();
      return { top, left, width, height };
    })
  );
};

// Its box and corners: a tile's, or the payday prompt's, which on a phone are round at the top only
const shapeOf = (target: TourTarget | undefined): Shape | null => {
  const box = boxOf(target);
  const [first] = target ? elementsOf(target) : [];
  if (!box || !first) return null;
  const style = getComputedStyle(first);
  // A fully round button says 9999px; no corner can be rounder than half the box
  const most = Math.min(box.width, box.height) / 2;
  const corner = (value: string) => Math.min(parseFloat(value) || 0, most);
  return {
    ...box,
    corners: [
      corner(style.borderTopLeftRadius),
      corner(style.borderTopRightRadius),
      corner(style.borderBottomRightRadius),
      corner(style.borderBottomLeftRadius)
    ]
  };
};

const areaOf = (isDesktop: boolean): Area =>
  isDesktop
    ? { top: 16, left: 16, right: innerWidth - 16, bottom: innerHeight - 16 }
    : { top: 12, left: 12, right: innerWidth - 12, bottom: innerHeight - MOBILE_NAV };

/*
 * Lays the tour out for a step: scrolls the page until what it's about shows in full with room
 * for the card, then keeps the lit areas and the card in place as the page scrolls or resizes.
 * Each step mounts it afresh, so it starts empty.
 */
export const useTourLayout = ({
  step,
  isDesktop,
  cardRef
}: {
  step: TourStep | undefined;
  isDesktop: boolean;
  cardRef: RefObject<HTMLElement | null>;
}) => {
  const [layout, setLayout] = useState<TourLayout>(EMPTY);

  useEffect(() => {
    if (!step) return;
    const anchorName = step.anchor ?? step.spot;
    const gap = isDesktop ? 24 : 12;
    // Chosen once the card and its target have been measured
    let side: Side | undefined;
    let settleFrame = 0;
    let measureFrame = 0;
    let waited = 0;

    const cardSize = (card: HTMLElement) => ({
      width: card.offsetWidth,
      height: card.offsetHeight
    });

    const measure = () => {
      const lit = [step.spot, ...(step.alsoLit ?? [])].flatMap(target => shapeOf(target) ?? []);
      const anchor = boxOf(anchorName);
      const card = cardRef.current;
      setLayout({
        lit,
        outline: shapeOf(step.spot),
        card:
          card && side !== undefined
            ? cardPosition(anchor ?? NOWHERE, {
                side,
                card: cardSize(card),
                area: areaOf(isDesktop),
                gap
              })
            : null
      });
    };

    const settle = () => {
      const anchor = boxOf(anchorName);
      const card = cardRef.current;
      if (!card) return;
      if (!anchor) {
        if (waited++ < MAX_WAIT) settleFrame = requestAnimationFrame(settle);
        else {
          side = null;
          measure();
        }
        return;
      }
      const area = areaOf(isDesktop);
      const size = cardSize(card);
      side = isDesktop
        ? chooseSide(anchor, { sides: DESKTOP_SIDES, card: size, area, gap })
        : step.below
          ? 'bottom'
          : 'top';
      // Only the page scrolls; the nav and sidebar are always in view
      const scroller = document.getElementById('main');
      const inPage = elementsOf(anchorName as TourTarget).some(element =>
        scroller?.contains(element)
      );
      if (scroller && inPage) {
        const distance = scrollToFit(anchor, { side, card: size, area, gap });
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (Math.abs(distance) > 1) {
          scroller.scrollBy({ top: distance, behavior: reduced ? 'auto' : 'smooth' });
        }
      }
      measure();
    };

    const remeasure = () => {
      cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(measure);
    };

    settleFrame = requestAnimationFrame(settle);
    addEventListener('resize', remeasure);
    // Capturing, so the page's own scrolling box is heard too
    document.addEventListener('scroll', remeasure, true);
    // Something that animates in, like the payday prompt growing to full size, is measured again
    // once it's there
    document.addEventListener('animationend', remeasure, true);
    return () => {
      cancelAnimationFrame(settleFrame);
      cancelAnimationFrame(measureFrame);
      removeEventListener('resize', remeasure);
      document.removeEventListener('scroll', remeasure, true);
      document.removeEventListener('animationend', remeasure, true);
    };
  }, [step, isDesktop, cardRef]);

  return layout;
};
