import { describe, expect, it } from 'vitest';
import { yearPaging } from './yearPaging';

describe('yearPaging', () => {
  it('goes back a year with previous and forward with next', () => {
    const paging = yearPaging([2026, 2025, 2023], 2025);
    expect(paging).toMatchObject({ label: '2025', page: 1, hasPrev: true, hasNext: true });
    expect(paging.yearOf(paging.page - 1)).toBe(2023);
    expect(paging.yearOf(paging.page + 1)).toBe(2026);
  });

  it('stops at the newest and oldest years', () => {
    expect(yearPaging([2026, 2025], 2026)).toMatchObject({ hasPrev: true, hasNext: false });
    expect(yearPaging([2026], 2026)).toMatchObject({ hasPrev: false, hasNext: false });
  });
});
