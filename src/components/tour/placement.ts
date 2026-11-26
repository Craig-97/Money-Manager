/*
 * Where the tour's card goes. Everything is in viewport pixels: the target is what's lit up, the
 * area is where the card and target may sit (the screen less its margins and the mobile nav).
 */

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Area {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Size {
  width: number;
  height: number;
}

// Which side of the target the card sits on; null for the top-right corner of the screen
export type Side = 'right' | 'left' | 'bottom' | 'top' | null;

interface Layout {
  card: Size;
  area: Area;
  gap: number;
}

const bottomOf = (box: Box) => box.top + box.height;
const rightOf = (box: Box) => box.left + box.width;
const clamp = (value: number, { min, max }: { min: number; max: number }) =>
  Math.min(Math.max(value, min), max);

/*
 * The first of `sides` with room for the card. Left and right need room beside the target; above
 * and below need room for both once the page is scrolled. With no room anywhere it's the corner.
 */
export const chooseSide = (
  target: Box,
  { sides, card, area, gap }: Layout & { sides: readonly Exclude<Side, null>[] }
): Side => {
  const stacks = target.height + gap + card.height <= area.bottom - area.top;
  const fits = {
    right: area.right - rightOf(target) >= card.width + gap,
    left: target.left - area.left >= card.width + gap,
    bottom: stacks,
    top: stacks
  };
  return sides.find(side => fits[side]) ?? null;
};

/*
 * How far to scroll (down is positive) so the whole target shows, with the card above or below it.
 * A target too tall for that shows its top, so a list's heading and tabs stay in view.
 */
export const scrollToFit = (target: Box, { side, card, area, gap }: Layout & { side: Side }) => {
  const minTop = side === 'top' ? area.top + card.height + gap : area.top;
  const maxBottom = side === 'bottom' ? area.bottom - card.height - gap : area.bottom;
  // Scrolling by d moves the target up by d
  const least = bottomOf(target) - maxBottom;
  const most = target.top - minTop;
  if (least > most) return most;
  return clamp(0, { min: least, max: most });
};

/* The card's top-left corner, kept inside the area */
export const cardPosition = (target: Box, { side, card, area, gap }: Layout & { side: Side }) => {
  const besideTop = target.top + target.height / 2 - card.height / 2;
  // Above or below, it lines up with the target's right edge
  const alignedLeft = rightOf(target) - card.width;
  const spots = {
    right: { top: besideTop, left: rightOf(target) + gap },
    left: { top: besideTop, left: target.left - gap - card.width },
    bottom: { top: bottomOf(target) + gap, left: alignedLeft },
    top: { top: target.top - gap - card.height, left: alignedLeft },
    corner: { top: area.top, left: area.right - card.width }
  };
  const spot = spots[side ?? 'corner'];
  return {
    top: clamp(spot.top, { min: area.top, max: area.bottom - card.height }),
    left: clamp(spot.left, { min: area.left, max: area.right - card.width })
  };
};

/* One box around several, e.g. the mobile figures and the discretionary tile together */
export const unionOf = (boxes: readonly Box[]): Box | null => {
  if (!boxes.length) return null;
  const top = Math.min(...boxes.map(box => box.top));
  const left = Math.min(...boxes.map(box => box.left));
  const bottom = Math.max(...boxes.map(bottomOf));
  const right = Math.max(...boxes.map(rightOf));
  return { top, left, width: right - left, height: bottom - top };
};
