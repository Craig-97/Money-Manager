import { describe, expect, it } from 'vitest';
import { formatShortDay } from '~/lib/dates';
import { Payment } from '~/lib/payments';
import {
  BLANK_DRAFT,
  followPayments,
  followsByDefault,
  Note,
  noteDateFrom,
  noteInput,
  reminderHint,
  remindChoices,
  remindText,
  sameDraft
} from './notes';

const BLANK_NOTE: Note = {
  id: 'note',
  body: 'Note',
  color: 'BLUE',
  created: 0,
  updated: 0,
  date: null,
  remind: [],
  repeat: 'NONE',
  paymentId: null
};

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
        { date: '2026-11-07', remind: [7, 30], repeat: 'YEARLY', paymentId: '' },
        { today: TODAY, format }
      )
    ).toBe('You’ll get reminders on Thu 8 Oct and Sat 31 Oct, then on the same days each year.');
  });

  it('says when there are none, or they have gone by', () => {
    expect(
      reminderHint(
        { date: '2026-11-07', remind: [], repeat: 'NONE', paymentId: '' },
        { today: TODAY, format }
      )
    ).toMatch(/^No reminders/);
    expect(
      reminderHint(
        { date: '2026-10-05', remind: [30], repeat: 'NONE', paymentId: '' },
        { today: TODAY, format }
      )
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

describe('repeats', () => {
  it('comes round every month, 3 months or 6 months, keeping to the end of shorter months', () => {
    expect(noteDateFrom({ date: day('2026-03-31'), repeat: 'MONTHLY' }, TODAY)).toEqual(
      day('2026-10-31')
    );
    expect(noteDateFrom({ date: day('2026-04-01'), repeat: 'BIANNUALLY' }, TODAY)).toEqual(
      day('2027-04-01')
    );
    expect(noteDateFrom({ date: day('2026-01-15'), repeat: 'QUARTERLY' }, TODAY)).toEqual(
      day('2026-10-15')
    );
  });

  it("follows its payment's next date, and has none once the payment has ended", () => {
    const follows = { ...BLANK_NOTE, id: 'n', repeat: 'WITH_PAYMENT' as const, paymentId: 'tax' };
    const [withDate] = followPayments(
      [follows],
      [{ id: 'tax', dueDate: day('2026-11-01') } as Payment]
    );
    expect(withDate.date).toEqual(day('2026-11-01'));
    const [ended] = followPayments([follows], [{ id: 'tax', dueDate: null } as Payment]);
    expect(ended.date).toBeNull();
  });

  it('only offers reminders that come after the time before', () => {
    expect(remindChoices({ repeat: 'WITH_PAYMENT', paymentFrequency: 'WEEKLY' })).toEqual([0, 1]);
    expect(remindChoices({ repeat: 'WITH_PAYMENT', paymentFrequency: 'BIWEEKLY' })).toEqual([
      0, 1, 7
    ]);
    expect(remindChoices({ repeat: 'MONTHLY' })).toEqual([0, 1, 7, 14]);
    expect(remindChoices({ repeat: 'YEARLY' })).toEqual([0, 1, 7, 14, 30]);
    expect(followsByDefault('BIWEEKLY')).toBe(false);
    expect(followsByDefault('MONTHLY')).toBe(true);
  });

  it('sends a note that follows its payment without a date of its own', () => {
    expect(
      noteInput({
        ...BLANK_DRAFT,
        body: 'Hi',
        date: '2026-11-01',
        remind: [7],
        repeat: 'WITH_PAYMENT',
        paymentId: 'tax'
      })
    ).toMatchObject({ date: null, remind: [7], repeat: 'WITH_PAYMENT', payment: 'tax' });
    // Without the payment there's nothing to follow
    expect(
      noteInput({ ...BLANK_DRAFT, body: 'Hi', date: '2026-11-01', repeat: 'WITH_PAYMENT' })
    ).toMatchObject({
      date: '2026-11-01',
      repeat: 'NONE'
    });
  });

  it('says when reminders come round for a note following its payment', () => {
    expect(
      reminderHint(
        { date: '', remind: [14], repeat: 'WITH_PAYMENT', paymentId: 'tax' },
        { today: TODAY, format: date => formatShortDay(date), paymentDue: day('2026-11-01') }
      )
    ).toBe('You’ll get a reminder on Sun 18 Oct, then before each payment after.');
  });
});
