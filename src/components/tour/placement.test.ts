import { cardPosition, chooseSide, scrollToFit, unionOf } from './placement';

const area = { top: 16, right: 1424, bottom: 884, left: 16 };
const card = { width: 380, height: 220 };
const layout = { card, area, gap: 24 };
const DESKTOP_SIDES = ['right', 'left', 'bottom', 'top'] as const;

describe('chooseSide', () => {
  it('puts the card to the right of a tile with room there', () => {
    const tile = { top: 150, left: 340, width: 640, height: 400 };
    expect(chooseSide(tile, { ...layout, sides: DESKTOP_SIDES })).toBe('right');
  });

  it('falls back to the left of a tile at the right edge', () => {
    const tile = { top: 150, left: 1013, width: 387, height: 400 };
    expect(chooseSide(tile, { ...layout, sides: DESKTOP_SIDES })).toBe('left');
  });

  it('goes below a full-width tile', () => {
    const tile = { top: 300, left: 340, width: 1060, height: 160 };
    expect(chooseSide(tile, { ...layout, sides: DESKTOP_SIDES })).toBe('bottom');
  });

  it('uses the corner when the tile is too big for anywhere', () => {
    const list = { top: 100, left: 340, width: 1060, height: 1500 };
    expect(chooseSide(list, { ...layout, sides: DESKTOP_SIDES })).toBeNull();
  });
});

describe('scrollToFit', () => {
  const phone = { area: { top: 12, right: 378, bottom: 740, left: 12 }, gap: 12 };
  const phoneCard = { width: 366, height: 200 };

  it('leaves a target that already fits where it is', () => {
    const hero = { top: 80, left: 16, width: 358, height: 300 };
    expect(scrollToFit(hero, { ...phone, side: 'bottom', card: phoneCard })).toBe(0);
  });

  it('scrolls a half-hidden target up until it and the card below it show', () => {
    const hero = { top: 500, left: 16, width: 358, height: 300 };
    // Its bottom has to end 212px above the area's bottom
    expect(scrollToFit(hero, { ...phone, side: 'bottom', card: phoneCard })).toBe(272);
  });

  it('scrolls back to make room for the card above', () => {
    const figures = { top: 60, left: 16, width: 358, height: 200 };
    expect(scrollToFit(figures, { ...phone, side: 'top', card: phoneCard })).toBe(-164);
  });

  it('shows the top of a list too tall to fit, just under the card', () => {
    const list = { top: 900, left: 16, width: 358, height: 1400 };
    expect(scrollToFit(list, { ...phone, side: 'top', card: phoneCard })).toBe(676);
  });
});

describe('cardPosition', () => {
  it('centres a card beside its tile', () => {
    const tile = { top: 150, left: 1013, width: 387, height: 400 };
    expect(cardPosition(tile, { ...layout, side: 'left' })).toEqual({ top: 240, left: 609 });
  });

  it('lines a card below up with the right edge of the tile', () => {
    const tile = { top: 300, left: 340, width: 1060, height: 160 };
    expect(cardPosition(tile, { ...layout, side: 'bottom' })).toEqual({ top: 484, left: 1020 });
  });

  it('keeps the card on screen', () => {
    const link = { top: 840, left: 16, width: 268, height: 52 };
    expect(cardPosition(link, { ...layout, side: 'right' }).top).toBe(664);
  });

  it('puts a card with no side in the top-right corner', () => {
    const list = { top: 100, left: 340, width: 1060, height: 1500 };
    expect(cardPosition(list, { ...layout, side: null })).toEqual({ top: 16, left: 1044 });
  });
});

describe('unionOf', () => {
  it('wraps several boxes', () => {
    expect(
      unionOf([
        { top: 10, left: 16, width: 100, height: 50 },
        { top: 70, left: 16, width: 200, height: 40 }
      ])
    ).toEqual({ top: 10, left: 16, width: 200, height: 100 });
  });

  it('is nothing for no boxes', () => {
    expect(unionOf([])).toBeNull();
  });
});
