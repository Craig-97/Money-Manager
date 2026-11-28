import { describe, expect, it } from 'vitest';
import { pageOf } from './pageOf';

describe('pageOf', () => {
  const items = Array.from({ length: 11 }, (_, i) => i);

  it('gives a page of the list, with which way it can move', () => {
    expect(pageOf(items, { size: 8, page: 0 })).toEqual({
      items: [0, 1, 2, 3, 4, 5, 6, 7],
      page: 0,
      paged: true,
      label: '1–8 of 11',
      hasPrev: false,
      hasNext: true
    });
    expect(pageOf(items, { size: 8, page: 1 })).toMatchObject({
      items: [8, 9, 10],
      label: '9–11 of 11',
      hasPrev: true,
      hasNext: false
    });
  });

  it('keeps to the last page when the list gets shorter', () => {
    expect(pageOf(items, { size: 8, page: 5 }).page).toBe(1);
    expect(pageOf(items, { size: 20, page: 0 }).paged).toBe(false);
  });
});
