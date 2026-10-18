import { describe, expect, it } from 'vitest';
import { formatShortDay } from '~/lib/dates';
import { BLANK_DRAFT, noteDateFrom, noteInput, reminderHint, remindText, sameDraft } from './notes';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};

const TODAY = day('2026-10-02');

describe('noteDateFrom', () => {
  it('keeps a one-off date, gone by or not', () => {
    expect(noteDateFrom({ date: day('2026-03-01'), repeat: 'NONE' }, TODAY)).toEqual(
      day('2026-03-01')
    );
  });

  it('brings a yearly date round to the next time it comes', () => {
    expect(noteDateFrom({ date: day('2024-11-07'), repeat: 'YEARLY' }, TODAY)).toEqual(
      day('2026-11-07')
    );
    expect(noteDateFrom({ date: day('2024-03-01'), repeat: 'YEARLY' }, TODAY)).toEqual(
      day('2027-03-01')
    );
    // 29 February falls on the 28th in other years
    expect(noteDateFrom({ date: day('2024-02-29'), repeat: 'YEARLY' }, TODAY)).toEqual(
      day('2027-02-28')
    );
  });

  it('has nothing without a date', () => {
    expect(noteDateFrom({ date: null, repeat: 'YEARLY' }, TODAY)).toBeNull();
  });
});

describe('remindText', () => {
  it('says when a note reminds, furthest first', () => {
    expect(remindText([7, 30])).toBe('1 month and 1 week before');
    expect(remindText([0])).toBe('On the day');
    expect(remindText([14, 0])).toBe('2 weeks before and on the day');
    expect(remindText([1, 7, 30])).toBe('1 month, 1 week and 1 day before');
  });
});

describe('reminderHint', () => {
  const format = (date: Date) => formatShortDay(date);

  it('lists the days its reminders go off on', () => {
    expect(
      reminderHint(
        { date: '2026-11-07', remind: [7, 30], repeat: 'YEARLY' },
        { today: TODAY, format }
      )
    ).toBe('You’ll get reminders on Thu 8 Oct and Sat 31 Oct, then on the same days each year.');
  });

  it('says when there are none, or they have gone by', () => {
    expect(
      reminderHint({ date: '2026-11-07', remind: [], repeat: 'NONE' }, { today: TODAY, format })
    ).toMatch(/^No reminders/);
    expect(
      reminderHint({ date: '2026-10-05', remind: [30], repeat: 'NONE' }, { today: TODAY, format })
    ).toBe('Its reminders have gone by.');
  });
});

describe('noteInput', () => {
  it('sends no reminders or repeat without a date', () => {
    expect(noteInput({ ...BLANK_DRAFT, body: 'Hi', remind: [7], repeat: 'YEARLY' })).toEqual({
      body: 'Hi',
      color: 'BLUE',
      date: null,
      remind: [],
      repeat: 'NONE',
      payment: null
    });
  });

  it('counts drafts that save the same note as the same', () => {
    const draft = { ...BLANK_DRAFT, body: 'Hi', date: '2026-11-07', remind: [7, 30] };
    expect(sameDraft(draft, { ...draft, remind: [30, 7] })).toBe(true);
    expect(sameDraft(draft, { ...draft, date: '' })).toBe(false);
  });
});
