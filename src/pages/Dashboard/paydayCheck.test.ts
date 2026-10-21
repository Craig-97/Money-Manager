import { describe, expect, it } from 'vitest';
import { RecurringPaymentFieldsFragment } from '~/graphql/generated';
import { toPayments } from '~/lib/payments';
import {
  balanceParts,
  dueSinceDetail,
  dueSinceOf,
  leftOverDetail,
  leftOverNote,
  leftOverOf,
  suggestedBalance
} from './paydayCheck';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};
const apiDate = (iso: string) => String(Date.parse(`${iso}T00:00:00Z`));

const recurring = (
  overrides: Partial<RecurringPaymentFieldsFragment> & { name: string }
): RecurringPaymentFieldsFragment => ({
  __typename: 'RecurringPayment',
  id: overrides.name.toLowerCase(),
  amount: 20,
  category: 'SUBSCRIPTIONS',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-26'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  dueReminder: { __typename: 'ReminderTiming', off: false, days: null },
  renewalReminder: { __typename: 'ReminderTiming', off: false, days: null },
  debt: null,
  account: null,
  paysInto: null,
  ...overrides
});

// Payday was Fri 30 Oct 2026, and the prompt is open the day after
const today = day('2026-10-31');
const cycle = {
  start: day('2026-10-30'),
  end: day('2026-11-27'),
  endUsual: day('2026-11-27'),
  isPayday: false
};

const payments = toPayments(
  {
    recurringPayments: [
      // Never marked paid for Mon 26 Oct
      recurring({ name: 'Netflix', nextDueDate: apiDate('2026-10-26') }),
      recurring({
        name: 'Card',
        amount: 150,
        category: 'FINANCES',
        firstPaymentDate: apiDate('2026-01-27'),
        nextDueDate: apiDate('2026-10-27'),
        debt: {
          __typename: 'Debt',
          balance: 2340,
          startingBalance: 3500,
          apr: 24.9,
          balanceUpdatedAt: null,
          paidOffThisCycle: 0
        }
      }),
      // Due on payday
      recurring({
        name: 'Gym',
        amount: 35,
        firstPaymentDate: apiDate('2026-01-30'),
        nextDueDate: apiDate('2026-10-30')
      })
    ],
    oneOffPayments: []
  },
  today
);

describe('the payday check', () => {
  const leftOver = leftOverOf(payments, cycle);

  it('finds last cycle’s left-over payments, and payments due since payday', () => {
    expect(leftOver.map(item => item.payment.name)).toEqual(['Netflix', 'Card']);
    expect(
      dueSinceOf(payments, { cycle, today, stillDue: new Set() }).map(item => item.payment.name)
    ).toEqual(['Gym']);
  });

  it('suggests the balance less what went out, adding back what didn’t', () => {
    const gym = dueSinceOf(payments, { cycle, today, stillDue: new Set() });
    // £1,000 + £3,600, less Netflix (£20), the card (£150) and the gym (£35)
    expect(
      suggestedBalance({ bankBalance: 1000, income: 3600, leftOver, outcomes: {}, goneOut: gym })
    ).toBe(4395);
    // The card didn't go out, and the gym isn't ticked
    expect(
      suggestedBalance({
        bankBalance: 1000,
        income: 3600,
        leftOver,
        outcomes: { card: 'SKIPPED' },
        goneOut: []
      })
    ).toBe(4580);
  });

  it('says only what else happens: a debt paid down after interest, or when it’s next due', () => {
    const [netflix, card] = leftOver;
    expect(leftOverNote(netflix, { outcome: 'PAID', cycle, today })).toBeNull();
    expect(leftOverNote(card, { outcome: 'PAID', cycle, today })).toBe(
      '£101.44 off what you owe, after £48.56 interest'
    );
    expect(leftOverNote(card, { outcome: 'SKIPPED', cycle, today })).toBe('Next due Fri 27 Nov');
    expect(leftOverNote(card, { outcome: 'DUE', cycle, today })).toBe(
      'Stays due, shown as overdue'
    );
  });

  it('names the account each goes out of when there’s more than one', () => {
    const [netflix, card] = leftOver;
    const [gym] = dueSinceOf(payments, { cycle, today, stillDue: new Set() });
    expect(leftOverDetail(netflix, { today })).toBe('Monthly · was due Mon 26 Oct');
    expect(leftOverDetail(netflix, { today, fromName: 'Everyday' })).toBe(
      'From Everyday · was due Mon 26 Oct'
    );
    expect(leftOverDetail(card, { today, fromName: 'Everyday' })).toBe(
      'Debt · from Everyday · was due Tue 27 Oct'
    );
    expect(dueSinceDetail(gym, { today, fromName: 'Everyday', intoName: 'Joint bills' })).toBe(
      'From Everyday into Joint bills · due Fri 30 Oct'
    );
  });

  it('splits the suggestion into the parts that add up to it', () => {
    const goneOut = dueSinceOf(payments, { cycle, today, stillDue: new Set() });
    const outcomes = { card: 'SKIPPED' as const };
    const parts = balanceParts({
      bankBalance: 1000,
      leftOver,
      outcomes,
      goneOut,
      intoNameOf: payment => (payment.name === 'Gym' ? 'Joint bills' : null)
    });
    // Both left-overs taken off first, then the card added back
    expect(parts).toEqual({
      start: 830,
      changes: [
        { amount: -35, label: 'to Joint bills' },
        { amount: 150, label: 'not gone out' }
      ]
    });
    const total = parts.changes.reduce((sum, change) => sum + change.amount, parts.start + 3600);
    expect(total).toBe(
      suggestedBalance({ bankBalance: 1000, income: 3600, leftOver, outcomes, goneOut })
    );
  });
});
