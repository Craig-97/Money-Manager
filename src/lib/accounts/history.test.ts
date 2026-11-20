import { describe, expect, it } from 'vitest';
import { AccountHistoryQuery } from '~/graphql/generated';
import { balanceChanges, interestInYear } from './history';
import { apiDate } from '~/test/dates';

type ChangeRecord = NonNullable<AccountHistoryQuery['account']>['history'][number];

const change = (
  kind: ChangeRecord['kind'],
  {
    date,
    change: amount,
    balanceAfter,
    name = null
  }: Omit<ChangeRecord, '__typename' | 'id' | 'kind' | 'date'> & { date: string }
): ChangeRecord => ({
  __typename: 'AccountChange',
  id: `${kind}-${date}`,
  kind,
  date: apiDate(date),
  change: amount,
  balanceAfter,
  name
});

const records = [
  change('INTEREST', { date: '2026-10-01', change: 14.12, balanceAfter: 4200, name: null }),
  change('BALANCE_SET', { date: '2026-09-23', change: -4.12, balanceAfter: 4185.88, name: null }),
  change('MOVE_IN', { date: '2026-09-14', change: 500, balanceAfter: 4190, name: 'Everyday' }),
  change('MOVE_OUT', { date: '2026-08-17', change: -250, balanceAfter: 3690, name: 'Everyday' }),
  change('PAYMENT', { date: '2026-08-02', change: -20, balanceAfter: 3940, name: 'Netflix' }),
  change('OPENING', { date: '2026-01-01', change: 3960, balanceAfter: 3960, name: null })
];

const easyAccess = {
  balance: 4200,
  interest: {
    rate: 4.1,
    frequency: 'MONTHLY' as const,
    day: 1,
    nextDate: new Date(2026, 10, 1),
    accrued: 0,
    accruedTo: null,
    added: []
  }
};

describe('balanceChanges', () => {
  it('says what each change was, with the balance before one typed in', () => {
    const changes = balanceChanges(easyAccess, { records, next: false });

    expect(changes.map(item => [item.label, item.tone, item.note, item.change])).toEqual([
      ['Interest added', 'green', null, 14.12],
      ['Balance updated', 'plain', 'Was £4,190.00', -4.12],
      ['Moved in', 'plain', 'From Everyday', 500],
      ['Moved out', 'plain', 'To Everyday', -250],
      ['Paid', 'plain', 'Netflix', -20],
      ['Opening balance', 'plain', null, null]
    ]);
  });

  it('leads with the next interest, worked out ahead, on savings paid on a schedule', () => {
    const [next] = balanceChanges(easyAccess, { records, next: true });

    // A twelfth of 4.1% AER, compounding, on £4,200
    const month = Math.round(4200 * (1.041 ** (1 / 12) - 1) * 100) / 100;
    expect(next).toMatchObject({
      kind: 'DUE',
      label: 'Interest due',
      tone: 'accent',
      estimate: true
    });
    expect(next.change).toBe(month);
    expect(next.balanceAfter).toBeCloseTo(4200 + month, 2);
    expect(balanceChanges({ ...easyAccess, interest: null }, { records, next: true })).toHaveLength(
      records.length
    );
  });
});

describe('interestInYear', () => {
  it('adds up the interest a year added', () => {
    const changes = balanceChanges(easyAccess, { records, next: true });
    expect(interestInYear(changes, 2026)).toBe('£14.12 interest in 2026');
    expect(interestInYear([], 2026)).toBeNull();
  });
});
