import { describe, expect, it } from 'vitest';
import { DebtHistoryQuery } from '~/graphql/generated';
import { DebtPayment } from './debts';
import { byMonth, debtHistory, dueInText } from './history';

type HistoryRecord = NonNullable<DebtHistoryQuery['recurringPayment']>['history'][number];

const apiDate = (iso: string) => String(Date.parse(`${iso}T00:00:00Z`));
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
  dueReminder: { off: false, days: null },
  renewalReminder: { off: false, days: null },
  dueReminderDays: 1,
  debt: {
    balance: 2340,
    startingBalance: 3500,
    apr: 24.9,
    balanceUpdatedAt: null,
    paidOffThisCycle: 0
  },
  paysInto: null
};

const record = (
  kind: HistoryRecord['kind'],
  {
    date,
    balanceChange,
    debt,
    open = false
  }: {
    date: string;
    balanceChange: number;
    debt: Omit<NonNullable<HistoryRecord['debt']>, '__typename'> | null;
    open?: boolean;
  }
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
    const [next] = debtHistory(card, { records: [], today });
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
    const entries = debtHistory(card, {
      records: [
        record('OVERPAYMENT', {
          date: '2026-10-01',
          balanceChange: -200,
          debt: { interest: 0, reduction: 200, balanceAfter: 2340 },
          open: true
        }),
        record('BALANCE_SET', {
          date: '2026-09-20',
          balanceChange: 0,
          debt: { interest: 0, reduction: -10, balanceAfter: 2540 }
        }),
        record('SKIPPED', { date: '2026-09-15', balanceChange: 0, debt: null }),
        record('PAID', {
          date: '2026-08-15',
          balanceChange: -150,
          debt: {
            interest: 49.12,
            reduction: 100.88,
            balanceAfter: 2530
          }
        })
      ],
      today
    }).slice(1);

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
    expect(
      debtHistory({ ...card, debt: { ...card.debt, balance: 0 } }, { records: [], today })
    ).toEqual([]);
  });
});

describe('dueInText', () => {
  it('counts the days to go', () => {
    expect(dueInText(today, today)).toBe('Due today');
    expect(dueInText(new Date(2026, 9, 3), today)).toBe('Due tomorrow');
    expect(dueInText(new Date(2026, 8, 30), today)).toBe('Overdue');
  });
});

describe('byMonth', () => {
  it("puts each month's entries under it, newest first", () => {
    const entries = debtHistory(card, {
      records: [
        record('PAID', { date: '2026-09-15', balanceChange: -150, debt: null }),
        record('PAID', { date: '2026-09-01', balanceChange: -150, debt: null }),
        record('PAID', { date: '2026-08-15', balanceChange: -150, debt: null })
      ],
      today
    });
    expect(byMonth(entries).map(month => [month.label, month.entries.length])).toEqual([
      ['October 2026', 1],
      ['September 2026', 2],
      ['August 2026', 1]
    ]);
  });
});
