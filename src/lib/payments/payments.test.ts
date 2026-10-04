import { describe, expect, it } from 'vitest';
import { OneOffPaymentFieldsFragment, RecurringPaymentFieldsFragment } from '~/graphql/generated';
import { toIsoDate } from '~/lib/dates';
import { scheduleText } from './labels';
import { toPayments } from './payments';
import { nextOccurrence, occurrence } from './recurrence';
import { cycleDays, summarise } from './summary';

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
  amount: 10,
  category: 'SUBSCRIPTION',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-02'),
  lastPaymentDate: null,
  nextDueDate: null,
  status: 'UNPAID',
  ...overrides
});

const oneOff = (
  overrides: Partial<OneOffPaymentFieldsFragment> & { name: string }
): OneOffPaymentFieldsFragment => ({
  __typename: 'OneOffPayment',
  id: overrides.name.toLowerCase(),
  amount: 10,
  dueDate: apiDate('2026-10-09'),
  type: 'EXPENSE',
  category: 'OTHER',
  ...overrides
});

// The design's example: today Fri 2 Oct 2026, paid on the last Friday of the month
const today = day('2026-10-02');
const cycle = { start: day('2026-09-25'), end: day('2026-10-30'), isPayday: false };

const designPayments = toPayments(
  {
    recurringPayments: [
      recurring({ name: 'Netflix', amount: 20, nextDueDate: apiDate('2026-10-02') }),
      recurring({
        name: 'Mortgage',
        amount: 750,
        category: 'MORTGAGE',
        firstPaymentDate: apiDate('2026-01-28'),
        nextDueDate: apiDate('2026-10-28')
      }),
      recurring({
        name: 'Prime',
        amount: 95,
        frequency: 'ANNUALLY',
        firstPaymentDate: apiDate('2025-07-01'),
        nextDueDate: apiDate('2027-07-01')
      })
    ],
    oneOffPayments: [
      oneOff({ name: 'Shopping', amount: 10, type: 'INCOME' }),
      oneOff({ name: 'Birthday', amount: 75, category: 'GIFT', dueDate: apiDate('2026-10-20') })
    ]
  },
  today
);

describe('recurrence', () => {
  it('keeps the day of the month, using the end of shorter months', () => {
    expect(toIsoDate(occurrence(day('2026-01-31'), 'MONTHLY', 1))).toBe('2026-02-28');
    expect(toIsoDate(occurrence(day('2026-01-31'), 'MONTHLY', 2))).toBe('2026-03-31');
  });

  it('finds the next date on or after a day, stopping at the last payment', () => {
    const schedule = { firstPaymentDate: day('2026-01-15'), frequency: 'MONTHLY' as const };
    expect(toIsoDate(nextOccurrence(schedule, day('2026-10-16'))!)).toBe('2026-11-15');
    expect(
      nextOccurrence({ ...schedule, lastPaymentDate: day('2026-10-15') }, day('2026-10-16'))
    ).toBeNull();
  });

  it('works out the due date when the API has none', () => {
    const [netflix] = toPayments(
      { recurringPayments: [recurring({ name: 'Netflix', nextDueDate: null })] },
      day('2026-10-03')
    );
    expect(toIsoDate(netflix.dueDate!)).toBe('2026-11-02');
  });
});

describe('summarise', () => {
  const summary = summarise({
    payments: designPayments,
    bankBalance: 10000,
    monthlyIncome: 3600,
    cycle,
    today
  });

  it('matches the design: free to spend is the balance less what is due before payday', () => {
    expect(summary.upcomingNet).toBe(-835);
    expect(summary.freeToSpend).toBe(9165);
    expect(summary.onPayday).toBe(12765);
    expect(summary.unpaidCount).toBe(4);
  });

  it('splits income between recurring payments and the rest, keeping yearly ones apart', () => {
    expect(summary.monthlyRecurring).toBe(770);
    expect(summary.annualRecurring).toBe(95);
    expect(summary.discretionary).toBe(2830);
    expect(summary.afterRecurring).toBe(11995);
    expect(summary.recurringShare).toBeCloseTo(21.39, 2);
  });

  it('finds what is due today', () => {
    expect(summary.dueToday?.name).toBe('Netflix');
  });

  it('leaves out paid and skipped payments but keeps overdue ones', () => {
    const payments = toPayments(
      {
        recurringPayments: [
          recurring({ name: 'Paid', status: 'PAID', nextDueDate: apiDate('2026-10-10') }),
          recurring({ name: 'Skipped', status: 'SKIPPED', nextDueDate: apiDate('2026-10-10') })
        ],
        oneOffPayments: [oneOff({ name: 'Overdue', dueDate: apiDate('2026-09-01') })]
      },
      today
    );
    const result = summarise({ payments, bankBalance: 100, monthlyIncome: 0, cycle, today });

    expect(result.inCycle.map(p => p.name)).toEqual(['Overdue']);
    expect(result.upcomingNet).toBe(-10);
  });
});

describe('cycleDays', () => {
  it('has a day for each date from the last payday to the next', () => {
    const days = cycleDays(cycle, today, designPayments);

    expect(days).toHaveLength(36);
    expect(days[0]).toMatchObject({ kind: 'past', isLastPayday: true });
    expect(days[7]).toMatchObject({ kind: 'today' });
    expect(days[14].kind).toBe('income'); // Shopping, Fri 9 Oct
    expect(days[25].kind).toBe('expense'); // Birthday, Tue 20 Oct
    expect(days[35].kind).toBe('payday');
  });
});

describe('scheduleText', () => {
  it('describes how a payment repeats', () => {
    expect(scheduleText(day('2026-01-02'), 'MONTHLY')).toBe('Monthly on the 2nd');
    expect(scheduleText(day('2026-10-02'), 'WEEKLY')).toBe('Weekly on Fridays');
    expect(scheduleText(day('2026-10-02'), 'BIWEEKLY', { lower: true })).toBe('every other Friday');
    expect(scheduleText(day('2025-07-01'), 'ANNUALLY')).toBe('Annually on 1 Jul');
  });
});
