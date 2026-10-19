import { describe, expect, it } from 'vitest';
import { RecurringPaymentFieldsFragment } from '~/graphql/generated';
import { toPayments } from '~/lib/payments';
import { dueSinceOf, leftOverNote, leftOverOf, suggestedBalance } from './paydayCheck';

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
  category: 'SUBSCRIPTION',
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
        category: 'CREDIT_CARD',
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
});
