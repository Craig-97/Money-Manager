import { describe, expect, it } from 'vitest';
import { PaymentHistoryQuery } from '~/graphql/generated';
import { byMonth, dueInText, historySummary, paymentHistory } from './history';
import { RecurringPayment } from './payments';
import { apiDate, TODAY } from '~/test/dates';

type HistoryRecord = NonNullable<PaymentHistoryQuery['recurringPayment']>['history'][number];

const card: RecurringPayment = {
  kind: 'recurring',
  id: 'card',
  name: 'Credit card',
  amount: 150,
  signedAmount: -150,
  type: 'EXPENSE',
  category: 'FINANCES',
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
    paidOffThisCycle: 0,
    accrued: 0,
    accruedTo: null,
    rateEndsOn: null
  },
  account: null,
  paysInto: null,
  iconUrl: null,
  into: null,
  nonWorkingDay: null,
  move: { rule: 'ON_DAY', holidays: new Set() },
  movedFrom: null
};

const record = (
  kind: HistoryRecord['kind'],
  {
    date,
    balanceChange,
    debt = null,
    open = false,
    account = null
  }: {
    date: string;
    balanceChange: number;
    debt?: Omit<NonNullable<HistoryRecord['debt']>, '__typename'> | null;
    open?: boolean;
    account?: string | null;
  }
): HistoryRecord => ({
  __typename: 'PaymentRecord',
  id: `${kind}-${date}`,
  kind,
  dates: [apiDate(date)],
  balanceChange,
  account,
  open,
  createdAt: apiDate(date),
  debt: debt && { ...debt, __typename: 'PaymentRecordDebt' }
});

// As the dialog has it with one account to spend from: no From column
const noAccounts = { accountName: () => null, next: true };

describe('paymentHistory for a debt', () => {
  it('leads with the next payment, estimating what it will leave', () => {
    const [next] = paymentHistory(card, { records: [], today: TODAY, ...noAccounts });
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
    const entries = paymentHistory(card, {
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
      today: TODAY,
      ...noAccounts
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
      paymentHistory(
        { ...card, debt: { ...card.debt!, balance: 0 } },
        { records: [], today: TODAY, ...noAccounts }
      )
    ).toEqual([]);
  });
});

describe('dueInText', () => {
  it('counts the days to go', () => {
    expect(dueInText(TODAY, TODAY)).toBe('Due today');
    expect(dueInText(new Date(2026, 9, 3), TODAY)).toBe('Due tomorrow');
    expect(dueInText(new Date(2026, 8, 30), TODAY)).toBe('Overdue');
  });
});

describe('byMonth', () => {
  it("puts each month's entries under it, newest first", () => {
    const entries = paymentHistory(card, {
      ...noAccounts,
      records: [
        record('PAID', { date: '2026-09-15', balanceChange: -150, debt: null }),
        record('PAID', { date: '2026-09-01', balanceChange: -150, debt: null }),
        record('PAID', { date: '2026-08-15', balanceChange: -150, debt: null })
      ],
      today: TODAY
    });
    expect(byMonth(entries).map(month => [month.label, month.entries.length])).toEqual([
      ['October 2026', 1],
      ['September 2026', 2],
      ['August 2026', 1]
    ]);
  });
});

const netflix: RecurringPayment = {
  ...card,
  id: 'netflix',
  name: 'Netflix',
  amount: 20,
  debt: null
};

describe('paymentHistory for any other payment', () => {
  it('says where a price changed, and what each pay and skip was', () => {
    const entries = paymentHistory(netflix, {
      ...noAccounts,
      next: false,
      today: TODAY,
      records: [
        record('PAID', { date: '2026-09-02', balanceChange: -20 }),
        record('PAID', { date: '2026-08-02', balanceChange: -20 }),
        record('SKIPPED', { date: '2026-07-02', balanceChange: 0 }),
        record('PAID', { date: '2026-06-02', balanceChange: -18 }),
        record('PAID', { date: '2026-05-02', balanceChange: 0 })
      ]
    });

    expect(entries.map(entry => [entry.label, entry.note, entry.detail, entry.amount])).toEqual([
      ['Paid', null, '', 20],
      ['Paid', 'Up from £18.00', 'Up from £18.00', 20],
      ['Skipped', null, 'Nothing paid this time', null],
      ['Paid', null, '', 18],
      ['Paid', null, 'Counted in your payday balance', null]
    ]);
  });

  it('names the account each came out of once there are several, and leads with the next', () => {
    const [next, paid] = paymentHistory(
      { ...netflix, account: 'everyday' },
      {
        accountName: id => (id === 'everyday' ? 'Everyday' : null),
        next: true,
        today: TODAY,
        records: [
          record('PAID', { date: '2026-09-02', balanceChange: -20, account: 'everyday' }),
          record('PAID', { date: '2026-08-02', balanceChange: -18, account: 'everyday' })
        ]
      }
    );

    expect(next).toMatchObject({
      kind: 'due',
      account: 'Everyday',
      balanceAfter: null,
      amount: 20
    });
    expect(paid).toMatchObject({ account: 'Everyday', detail: 'From Everyday · up from £18.00' });
  });
});

describe('historySummary', () => {
  it('adds up what a year paid and skipped', () => {
    const entries = paymentHistory(netflix, {
      ...noAccounts,
      today: TODAY,
      records: [
        record('PAID', { date: '2026-09-02', balanceChange: -20 }),
        record('SKIPPED', { date: '2026-08-02', balanceChange: 0 }),
        record('PAID', { date: '2026-07-02', balanceChange: -18 })
      ]
    });
    expect(historySummary(netflix, { entries, year: 2026 })).toBe(
      'a month · £38.00 paid in 2026 · 1 skipped'
    );
    expect(historySummary(netflix, { entries: [], year: 2025 })).toBe(
      'a month · nothing paid in 2025'
    );
  });
});
