import { describe, expect, it } from 'vitest';
import {
  Account,
  accountMeta,
  accountTotals,
  forFreeToSpend,
  isStale,
  staleText,
  updatedText
} from './accounts';

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
  interestRate: null,
  purpose: null,
  balanceUpdatedAt: TODAY,
  ...fields
});

const current = account({
  id: 'current',
  name: 'Current account',
  kind: 'CURRENT',
  balance: 10000,
  counts: true
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
    expect(accountMeta(current)).toBe('Where you get paid');
    expect(accountMeta(isa)).toBe('Savings · 4.5%');
    expect(accountMeta({ ...isa, purpose: 'Holiday fund' })).toBe('Savings · 4.5% · Holiday fund');
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
