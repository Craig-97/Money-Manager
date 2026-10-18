import { describe, expect, it } from 'vitest';
import { DebtHistoryQuery } from '~/graphql/generated';
import { DebtPayment } from './debts';
import { debtHistory, dueInText } from './history';

type HistoryRecord = NonNullable<DebtHistoryQuery['recurringPayment']>['history'][number];

const apiDate = (iso: string) => String(new Date(`${iso}T00:00:00`).getTime());
const today = new Date(2026, 9, 2);

const card: DebtPayment = {
  kind: 'recurring',
  id: 'card',
  name: 'Credit card',
  amount: 150,
  signedAmount: -150,
  type: 'EXPENSE',
  category: 'CREDIT_CARD',
  frequency: 'MONTHLY',
  firstPaymentDate: new Date(2026, 0, 15),
  lastPaymentDate: null,
  dueDate: new Date(2026, 9, 15),
  thisCycle: [],
  renewalDate: null,
  renewalReminderDays: 0,
  debt: {
    balance: 2340,
    startingBalance: 3500,
    apr: 24.9,
    balanceUpdatedAt: null,
    paidOffThisCycle: 0
  }
};

const record = (
  kind: HistoryRecord['kind'],
  date: string,
  balanceChange: number,
  debt: Omit<NonNullable<HistoryRecord['debt']>, '__typename'> | null,
  open = false
): HistoryRecord => ({
  __typename: 'PaymentRecord',
  id: `${kind}-${date}`,
  kind,
  dates: [apiDate(date)],
  balanceChange,
  open,
  createdAt: apiDate(date),
  debt: debt && { ...debt, __typename: 'PaymentRecordDebt' }
});

describe('debtHistory', () => {
  it('leads with the next payment, estimating what it will leave', () => {
    const [next] = debtHistory(card, [], today);
    // £2,340 + a month's interest at 24.9% (£48.56) − £150
    expect(next).toMatchObject({
      kind: 'due',
      label: 'Due',
      detail: 'Due in 13 days',
      amount: 150,
      balanceAfter: 2238.56
    });
  });

  it('says what each record did', () => {
    const entries = debtHistory(
      card,
      [
        record(
          'OVERPAYMENT',
          '2026-10-01',
          -200,
          { interest: 0, reduction: 200, balanceAfter: 2340 },
          true
        ),
        record('BALANCE_SET', '2026-09-20', 0, { interest: 0, reduction: -10, balanceAfter: 2540 }),
        record('SKIPPED', '2026-09-15', 0, null),
        record('PAID', '2026-08-15', -150, {
          interest: 49.12,
          reduction: 100.88,
          balanceAfter: 2530
        })
      ],
      today
    ).slice(1);

    expect(entries.map(entry => [entry.label, entry.detail, entry.amount, entry.undoable])).toEqual(
      [
        ['Overpayment', 'All off the balance', 200, true],
        ['Balance updated', 'Set to £2,540.00', null, false],
        ['Skipped', 'Nothing paid this time', null, false],
        ['Paid', 'About £49 was interest', 150, false]
      ]
    );
  });

  it("has no next payment once it's paid off", () => {
    expect(debtHistory({ ...card, debt: { ...card.debt, balance: 0 } }, [], today)).toEqual([]);
  });
});

describe('dueInText', () => {
  it('counts the days to go', () => {
    expect(dueInText(today, today)).toBe('Due today');
    expect(dueInText(new Date(2026, 9, 3), today)).toBe('Due tomorrow');
    expect(dueInText(new Date(2026, 8, 30), today)).toBe('Overdue');
  });
});
