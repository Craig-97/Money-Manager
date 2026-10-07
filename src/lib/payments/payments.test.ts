import { describe, expect, it } from 'vitest';
import { OneOffPaymentFieldsFragment, RecurringPaymentFieldsFragment } from '~/graphql/generated';
import { toIsoDate } from '~/lib/dates';
import { cycleStatus, datesDue, paymentChoices } from './cycle';
import { scheduleText } from './labels';
import { RecurringPayment, toPayments } from './payments';
import { nextOccurrence, occurrence } from './recurrence';
import { cycleDays, summarise } from './summary';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};
const apiDate = (iso: string) => String(Date.parse(`${iso}T00:00:00Z`));
type HandledDates = RecurringPaymentFieldsFragment['handled'][number];
const handled = (outcome: HandledDates['outcome'], dates: string[]): HandledDates => ({
  __typename: 'HandledDates',
  outcome,
  dates: dates.map(apiDate)
});
const paid = (...dates: string[]) => handled('PAID', dates);
const skipped = (...dates: string[]) => handled('SKIPPED', dates);

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
  handled: [],
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
const cycle = {
  start: day('2026-09-25'),
  end: day('2026-10-30'),
  endUsual: day('2026-10-30'),
  isPayday: false
};

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

  it('takes recurring income off the recurring total, as v1 did', () => {
    const withIncome = summarise({
      payments: [
        ...designPayments,
        ...toPayments(
          {
            recurringPayments: [
              recurring({
                name: 'Rent from lodger',
                amount: 300,
                type: 'INCOME',
                nextDueDate: apiDate('2026-11-05')
              })
            ]
          },
          today
        )
      ],
      bankBalance: 10000,
      monthlyIncome: 3600,
      cycle,
      today
    });
    expect(withIncome.monthlyRecurring).toBe(470);
    expect(withIncome.afterRecurring).toBe(12295);
    expect(withIncome.discretionary).toBe(3130);
    expect(withIncome.recurringCount).toBe(4);
  });

  it('keeps quarterly payments with the yearly ones, at four a year', () => {
    const withQuarterly = summarise({
      payments: [
        ...designPayments,
        ...toPayments(
          {
            recurringPayments: [
              recurring({
                name: 'Water',
                amount: 30,
                frequency: 'QUARTERLY',
                nextDueDate: apiDate('2026-11-05')
              })
            ]
          },
          today
        )
      ],
      bankBalance: 10000,
      monthlyIncome: 3600,
      cycle,
      today
    });
    expect(withQuarterly.monthlyRecurring).toBe(770);
    expect(withQuarterly.annualRecurring).toBe(215);
    expect(withQuarterly.averagedRecurring).toEqual([]);
  });

  it('finds what is due today', () => {
    expect(summary.dueToday?.name).toBe('Netflix');
  });

  it('counts each date still to pay before payday, and keeps overdue ones', () => {
    const payments = toPayments(
      {
        recurringPayments: [
          // Paid for 28 Sep, so 5, 12, 19 and 26 Oct are still to pay
          recurring({
            name: 'Cleaner',
            amount: 50,
            frequency: 'WEEKLY',
            firstPaymentDate: apiDate('2026-09-28'),
            nextDueDate: apiDate('2026-10-05'),
            handled: [paid('2026-09-28')]
          }),
          // Paid for this cycle, so next due after payday
          recurring({
            name: 'Gym',
            firstPaymentDate: apiDate('2026-01-10'),
            nextDueDate: apiDate('2026-11-10'),
            handled: [paid('2026-10-10')]
          })
        ],
        oneOffPayments: [oneOff({ name: 'Overdue', dueDate: apiDate('2026-09-01') })]
      },
      today
    );
    const result = summarise({ payments, bankBalance: 1000, monthlyIncome: 0, cycle, today });

    expect(result.inCycle.map(p => p.name)).toEqual(['Cleaner', 'Overdue']);
    expect(result.upcomingNet).toBe(-210);
    expect(result.unpaidCount).toBe(5);
    // Weekly, so the monthly total uses its average: £50 × 52 ÷ 12
    expect(result.averagedRecurring).toEqual([{ name: 'Cleaner', perMonth: -216.67 }]);
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

  it('runs ghost days on from a payday brought forward to its usual date', () => {
    const early = { ...cycle, end: day('2026-10-23') };
    const days = cycleDays(early, today, designPayments);

    // The new payday is 23 Oct, a week before the usual 30 Oct: six ghost days, then the usual day
    expect(days).toHaveLength(36);
    expect(days[28].kind).toBe('payday');
    expect(days.slice(29, 35).map(item => item.kind)).toEqual(Array(6).fill('ghost'));
    expect(days[35].kind).toBe('ghostPayday');
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

describe('a weekly payment through the cycle', () => {
  // £50 every Monday from 28 Sep; the cycle runs 25 Sep to 30 Oct, so it falls five times
  const cleaner = (nextDueDate: string, handled: HandledDates[] = []) =>
    toPayments(
      {
        recurringPayments: [
          recurring({
            name: 'Cleaner',
            amount: 50,
            frequency: 'WEEKLY',
            firstPaymentDate: apiDate('2026-09-28'),
            nextDueDate: apiDate(nextDueDate),
            handled
          })
        ]
      },
      today
    )[0] as RecurringPayment;

  it('is due on every date left before payday', () => {
    expect(
      datesDue(cleaner('2026-10-12', [paid('2026-09-28', '2026-10-05')]), cycle).map(toIsoDate)
    ).toEqual(['2026-10-12', '2026-10-19', '2026-10-26']);
  });

  it('says how far through the cycle it is', () => {
    expect(cycleStatus(cleaner('2026-09-28'), cycle).label).toBe('Unpaid');
    expect(cycleStatus(cleaner('2026-10-05', [paid('2026-09-28')]), cycle).label).toBe(
      '1 of 5 paid'
    );
    expect(
      cycleStatus(cleaner('2026-10-12', [paid('2026-09-28'), skipped('2026-10-05')]), cycle).label
    ).toBe('1 paid · 1 skipped · 3 left');
    expect(
      cycleStatus(
        cleaner('2026-11-02', [
          paid('2026-09-28'),
          skipped('2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26')
        ]),
        cycle
      )
    ).toEqual({ tone: 'paid', label: 'Done' });
  });

  it('offers to pay or skip the next date by name, or skip the rest of the cycle', () => {
    expect(paymentChoices(cleaner('2026-10-05', [paid('2026-09-28')]), cycle, today)).toEqual({
      pay: 'Mark Mon 5 Oct as paid',
      undo: 'Mark Mon 28 Sep as unpaid',
      skipNext: 'Skip Mon 5 Oct',
      skipRest: 'Skip the rest of this cycle (4)'
    });
  });

  it('only offers to undo once every date before payday is dealt with', () => {
    const done = cleaner('2026-11-02', [
      skipped('2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26')
    ]);
    expect(paymentChoices(done, cycle, today)).toEqual({
      pay: null,
      undo: 'Undo skipping 5 dates',
      skipNext: null,
      skipRest: null
    });
  });
});

describe('a monthly payment through the cycle', () => {
  const netflix = (nextDueDate: string, handled: HandledDates[] = []) =>
    toPayments(
      {
        recurringPayments: [
          recurring({ name: 'Netflix', nextDueDate: apiDate(nextDueDate), handled })
        ]
      },
      today
    )[0];

  it('keeps the labels it always had', () => {
    expect(paymentChoices(netflix('2026-10-02'), cycle, today)).toEqual({
      pay: 'Mark as paid',
      undo: null,
      skipNext: 'Skip this cycle',
      skipRest: null
    });
    expect(paymentChoices(netflix('2026-11-02', [paid('2026-10-02')]), cycle, today)).toMatchObject(
      {
        pay: null,
        undo: 'Mark as unpaid'
      }
    );
  });
});

describe('a payment added partway through a cycle', () => {
  // The cycle runs 25 Sep to 30 Oct and today is 2 Oct
  const added = (fields: Partial<RecurringPaymentFieldsFragment>) =>
    toPayments(
      { recurringPayments: [recurring({ name: 'Added', ...fields })] },
      today
    )[0] as RecurringPayment;

  it('counts a date this cycle from before it was added as paid, with nothing to undo', () => {
    // Due on the 1st: 1 Oct had gone by when it was added, so it's next due 1 Nov
    const mortgage = added({
      firstPaymentDate: apiDate('2026-07-01'),
      nextDueDate: apiDate('2026-11-01')
    });
    expect(cycleStatus(mortgage, cycle)).toEqual({ tone: 'paid', label: 'Paid' });
    expect(paymentChoices(mortgage, cycle, today)).toMatchObject({ pay: null, undo: null });
  });

  it('counts the weeks already gone as paid', () => {
    const cleaner = added({
      frequency: 'WEEKLY',
      firstPaymentDate: apiDate('2026-09-21'),
      nextDueDate: apiDate('2026-10-05')
    });
    expect(cycleStatus(cleaner, cycle).label).toBe('1 of 5 paid');
  });

  it("says it's not due yet when none of its dates fall in this cycle", () => {
    const gym = added({
      firstPaymentDate: apiDate('2026-11-03'),
      nextDueDate: apiDate('2026-11-03')
    });
    expect(cycleStatus(gym, cycle).label).toBe('Not due yet');
    // It can still be paid ahead
    expect(paymentChoices(gym, cycle, today).pay).toBe('Mark as paid');
  });
});
