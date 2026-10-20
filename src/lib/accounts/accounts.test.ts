import { describe, expect, it } from 'vitest';
import { PayCycle } from '~/lib/payday';
import { OneOffPayment, RecurringPayment } from '~/lib/payments';
import {
  Account,
  accountMeta,
  accountOf,
  accountTotals,
  forFreeToSpend,
  hasSeveralSpending,
  isStale,
  staleText,
  unchosenOf,
  updatedText
} from './accounts';
import { beforePaydayByAccount, goesBelowZero } from './beforePayday';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};
const TODAY = day('2026-10-02');

const account = (fields: Partial<Account> & { id: string }): Account => ({
  name: fields.id,
  kind: 'SAVINGS',
  balance: 1000,
  counts: false,
  paidInto: false,
  interestRate: null,
  purpose: null,
  balanceUpdatedAt: TODAY,
  ...fields
});

const current = account({
  id: 'current',
  name: 'Current account',
  kind: 'SPENDING',
  balance: 10000,
  counts: true,
  paidInto: true
});
const joint = account({
  id: 'joint',
  name: 'Joint bills',
  kind: 'SPENDING',
  balance: 2105,
  counts: true,
  purpose: 'Shared household bills'
});
const isa = account({ id: 'isa', name: 'Cash ISA', balance: 8650, interestRate: 4.5 });
const easy = account({ id: 'easy', name: 'Easy access', balance: 4200, counts: true });

describe('accounts', () => {
  it('adds up everything, after what is owed, and what counts in free to spend', () => {
    expect(accountTotals([current, isa, easy], { owed: 10000 })).toEqual({
      spending: 10000,
      savings: 12850,
      owed: 10000,
      netWorth: 12850,
      counted: 14200,
      countedCount: 2
    });
  });

  it('says how old a balance is, flagging one four weeks old', () => {
    expect(updatedText(isa, TODAY)).toBe('Updated today');
    expect(updatedText({ balanceUpdatedAt: day('2026-10-01') }, TODAY)).toBe('Updated yesterday');
    expect(updatedText({ balanceUpdatedAt: day('2026-09-23') }, TODAY)).toBe('Updated 9 days ago');
    const old = { ...isa, balanceUpdatedAt: day('2026-08-28') };
    expect(updatedText(old, TODAY)).toBe('Updated 5 weeks ago');
    expect(isStale(old, TODAY)).toBe(true);
    expect(isStale({ balanceUpdatedAt: day('2026-09-05') }, TODAY)).toBe(false);
    expect(staleText(old, TODAY)).toBe('Cash ISA hasn’t been updated in 5 weeks');
  });

  it('describes each account under its name', () => {
    // One account to spend from: it's simply where you get paid
    expect(accountMeta(current, { several: false })).toBe('Where you get paid');
    // Several: each is spending, with what it's for, and a tag says where pay lands
    expect(accountMeta(current, { several: true })).toBe('Spending');
    expect(accountMeta(joint, { several: true })).toBe('Spending · Shared household bills');
    expect(accountMeta(isa, { several: true })).toBe('Savings · 4.5%');
    expect(accountMeta({ ...isa, purpose: 'Holiday fund' }, { several: false })).toBe(
      'Savings · 4.5% · Holiday fund'
    );
  });

  it('leaves payments into savings that count out of free to spend', () => {
    const payments = [
      { kind: 'recurring', id: 'into-isa', paysInto: 'isa' },
      { kind: 'recurring', id: 'into-easy', paysInto: 'easy' },
      { kind: 'oneOff', id: 'gift' }
    ];
    expect(forFreeToSpend(payments, [current, isa, easy]).map(payment => payment.id)).toEqual([
      'into-isa',
      'gift'
    ]);
  });
});

describe('several spending accounts', () => {
  it('only offers a choice once there is a second account to spend from', () => {
    expect(hasSeveralSpending([current, isa, easy])).toBe(false);
    expect(hasSeveralSpending([current, joint, isa])).toBe(true);
  });

  it('takes a payment out of the account it names, else where pay lands', () => {
    expect(accountOf({ account: 'joint' }, [current, joint])).toBe(joint);
    expect(accountOf({ account: null }, [current, joint])).toBe(current);
    // An account deleted since
    expect(accountOf({ account: 'gone' }, [current, joint])).toBe(current);
  });

  it('finds recurring expenses that don’t say which account they go out of', () => {
    const payments = [
      { kind: 'recurring', type: 'EXPENSE', id: 'water', account: null },
      { kind: 'recurring', type: 'EXPENSE', id: 'energy', account: 'joint' },
      { kind: 'recurring', type: 'INCOME', id: 'benefit', account: null },
      { kind: 'oneOff', type: 'EXPENSE', id: 'hotel', account: null }
    ];
    expect(unchosenOf(payments, [current, joint]).map(payment => payment.id)).toEqual(['water']);
    expect(unchosenOf(payments, [current, isa])).toEqual([]);
  });
});

describe('before payday by account', () => {
  const cycle: PayCycle = {
    start: day('2026-09-25'),
    end: day('2026-10-30'),
    endUsual: day('2026-10-30')
  } as PayCycle;

  const recurring = (
    fields: Partial<RecurringPayment> & { id: string; amount: number; dueDate: Date }
  ) =>
    ({
      kind: 'recurring',
      name: fields.id,
      signedAmount: -fields.amount,
      type: 'EXPENSE',
      category: 'UTILITIES',
      frequency: 'ANNUALLY',
      firstPaymentDate: fields.dueDate,
      lastPaymentDate: null,
      thisCycle: [],
      renewalDate: null,
      dueReminder: { off: false, days: null },
      renewalReminder: { off: false, days: null },
      dueReminderDays: 1,
      renewalReminderDays: 0,
      debt: null,
      account: null,
      paysInto: null,
      ...fields
    }) as RecurringPayment;
  const oneOff = (fields: Partial<OneOffPayment> & { id: string; amount: number; dueDate: Date }) =>
    ({
      kind: 'oneOff',
      name: fields.id,
      signedAmount: -fields.amount,
      type: 'EXPENSE',
      category: 'TRAVEL',
      paidAt: null,
      dueReminder: { off: false, days: null },
      dueReminderDays: 1,
      account: null,
      ...fields
    }) as OneOffPayment;

  const holiday = account({
    id: 'holiday',
    name: 'Holiday spending',
    kind: 'SPENDING',
    balance: 180,
    counts: true
  });
  const payments = [
    recurring({ id: 'Netflix', amount: 12.99, dueDate: day('2026-10-21') }),
    recurring({ id: 'Energy', amount: 120, dueDate: day('2026-10-09'), account: 'joint' }),
    recurring({ id: 'ISA top-up', amount: 250, dueDate: day('2026-10-25'), paysInto: 'isa' }),
    // On payday itself: next cycle
    recurring({
      id: 'Joint bills top-up',
      amount: 600,
      dueDate: day('2026-10-30'),
      paysInto: 'joint'
    }),
    oneOff({ id: 'Hotel deposit', amount: 220, dueDate: day('2026-10-23'), account: 'holiday' })
  ];

  const rows = beforePaydayByAccount([current, joint, holiday, isa], { payments, cycle });
  const rowOf = (id: string) => rows.find(row => row.account.id === id)!;

  it('takes each payment off its own account, and adds money moved into another', () => {
    expect(rowOf('current')).toMatchObject({ goesOut: 262.99, comesIn: 0, left: 9737.01 });
    expect(rowOf('current').movements.map(item => item.payment.name)).toEqual([
      'Netflix',
      'ISA top-up'
    ]);
    expect(rowOf('joint')).toMatchObject({ goesOut: 120, left: 1985 });
    expect(rowOf('isa')).toMatchObject({ comesIn: 250, left: 8900 });
    expect(rowOf('isa').movements[0].other).toBe(current);
  });

  it('keeps money moving on payday for the next cycle', () => {
    expect(rowOf('joint').onPayday).toEqual([
      expect.objectContaining({ amount: 600, other: current })
    ]);
    expect(rowOf('current').onPayday[0].amount).toBe(-600);
  });

  it('finds the lowest point, and an account that would go below £0', () => {
    expect(rowOf('holiday').lowest).toEqual({ amount: -40, date: day('2026-10-23') });
    expect(goesBelowZero(rowOf('holiday'))).toBe(true);
    expect(goesBelowZero(rowOf('joint'))).toBe(false);
  });
});
