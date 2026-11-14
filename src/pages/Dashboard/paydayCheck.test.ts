import { describe, expect, it } from 'vitest';
import { OneOffPaymentFieldsFragment, RecurringPaymentFieldsFragment } from '~/graphql/generated';
import { Account } from '~/lib/accounts';
import { PaydayConfig } from '~/lib/dates';
import { toPayments } from '~/lib/payments';
import {
  accountMoves,
  balanceParts,
  dueSinceDetail,
  dueSinceOf,
  leftOverDetail,
  leftOverNote,
  leftOverOf,
  movedInto,
  needsNewCycle,
  otherAccountLine,
  overdueOneOffs,
  paydaysSince,
  startedText,
  suggestedBalance
} from './paydayCheck';

const NO_HOLIDAYS = new Set<string>();
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
  // On its own dates, unless a test is about moving them off weekends
  nonWorkingDay: 'ON_DAY',
  ...overrides
});

const oneOff = (
  overrides: Partial<OneOffPaymentFieldsFragment> & { name: string }
): OneOffPaymentFieldsFragment => ({
  __typename: 'OneOffPayment',
  id: overrides.name.toLowerCase(),
  amount: 50,
  dueDate: apiDate('2026-10-20'),
  type: 'EXPENSE',
  category: 'BILLS',
  paidAt: null,
  account: null,
  dueReminder: { __typename: 'ReminderTiming', off: false, days: null },
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
          paidOffThisCycle: 0,
          accrued: 0,
          accruedTo: null
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
  { today, holidays: NO_HOLIDAYS }
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

describe('starting the cycle', () => {
  const account = (overrides: Partial<Account> & { id: string }): Account => ({
    name: overrides.id,
    kind: 'SAVINGS',
    balance: 1000,
    counts: false,
    paidInto: false,
    interest: null,
    purpose: null,
    balanceUpdatedAt: day('2026-10-28'),
    ...overrides
  });
  const current = account({ id: 'current', kind: 'SPENDING', paidInto: true });
  const joint = account({ id: 'joint', kind: 'SPENDING' });
  const isa = account({ id: 'isa' });

  it('is due once payday is after the last cycle was started', () => {
    expect(needsNewCycle(cycle, apiDate('2026-09-30'))).toBe(true);
    expect(needsNewCycle(cycle, apiDate('2026-10-30'))).toBe(false);
    expect(needsNewCycle(cycle, null)).toBe(true);
  });

  it('counts every payday missed since the last start, and one otherwise', () => {
    const payday = { frequency: 'MONTHLY', type: 'LAST_DAY' } as PaydayConfig;
    const holidays = NO_HOLIDAYS;
    expect(
      paydaysSince({ cycleStartedOn: apiDate('2026-08-31'), payday }, { cycle, holidays })
    ).toBe(2);
    expect(
      paydaysSince({ cycleStartedOn: apiDate('2026-09-30'), payday }, { cycle, holidays })
    ).toBe(1);
    expect(paydaysSince({ cycleStartedOn: null, payday }, { cycle, holidays })).toBe(1);
  });

  it('finds one-offs from last cycle still unpaid', () => {
    const [due, paid, later] = toPayments(
      {
        recurringPayments: [],
        oneOffPayments: [
          oneOff({ name: 'Boiler', dueDate: apiDate('2026-10-20') }),
          oneOff({ name: 'Tyres', dueDate: apiDate('2026-10-21'), paidAt: apiDate('2026-10-21') }),
          oneOff({ name: 'Gift', dueDate: apiDate('2026-10-31') })
        ]
      },
      { today, holidays: NO_HOLIDAYS }
    );
    expect(overdueOneOffs([due, paid, later], cycle)).toEqual([due]);
  });

  it('totals what ticked payments move into each account', () => {
    const [toIsa] = toPayments(
      {
        recurringPayments: [
          recurring({
            name: 'Saving',
            amount: 200,
            nextDueDate: apiDate('2026-10-30'),
            firstPaymentDate: apiDate('2026-01-30'),
            paysInto: 'isa'
          })
        ],
        oneOffPayments: []
      },
      { today, holidays: NO_HOLIDAYS }
    );
    const goneOut = [
      { key: 'saving', payment: toIsa, dates: [day('2026-10-30'), day('2026-10-31')] }
    ];
    expect(movedInto(goneOut, () => 'Cash ISA')).toEqual([{ name: 'Cash ISA', amount: 400 }]);
    expect(movedInto(goneOut, () => null)).toEqual([]);

    // Paid out of the joint account into the ISA; what leaves the current account isn't counted
    const fromJoint = { ...toIsa, account: 'joint' } as typeof toIsa;
    const { paidIn, paidOut } = accountMoves(
      [{ key: 'saving', payment: fromJoint, dates: [day('2026-10-30')] }],
      { accounts: [current, joint, isa], paidIntoId: 'current' }
    );
    expect(Object.fromEntries(paidIn)).toEqual({ isa: 200 });
    expect(Object.fromEntries(paidOut)).toEqual({ joint: 200 });
    expect(
      accountMoves([{ key: 'saving', payment: toIsa, dates: [day('2026-10-30')] }], {
        accounts: [current, joint, isa],
        paidIntoId: 'current'
      }).paidOut.size
    ).toBe(0);
  });

  it('says what changed under each other account', () => {
    expect(otherAccountLine(joint, { added: 600, out: 440.02, today })).toEqual({
      text: 'After £440.02 of bills, with the £600.00 top-up',
      stale: false
    });
    expect(otherAccountLine(joint, { added: 0, out: 440.02, today }).text).toBe(
      'After £440.02 of bills · updated 3 days ago'
    );
    expect(otherAccountLine(isa, { added: 200, out: 0, today }).text).toBe(
      'Includes £200.00 paid in'
    );
    // Only how long ago it was updated, and long enough to be amber
    const old = account({ id: 'old', balanceUpdatedAt: day('2026-09-01') });
    expect(otherAccountLine(old, { added: 0, out: 0, today })).toEqual({
      text: 'Updated 2 months ago',
      stale: true
    });
  });

  it('sums up what starting the cycle did', () => {
    expect(
      startedText({
        paid: ['Netflix', 'Gym'],
        skipped: ['Card'],
        moved: [
          { amount: 600, name: 'Joint bills', spending: true },
          { amount: 200, name: 'Cash ISA', spending: false }
        ],
        updated: ['Savings']
      })
    ).toBe(
      'Netflix and Gym were recorded as paid. Card was recorded as skipped. £600.00 moved to Joint bills. £200.00 added to Cash ISA. Savings was updated.'
    );
    expect(startedText({ paid: [], skipped: [], moved: [], updated: [] })).toBe('');
  });
});
