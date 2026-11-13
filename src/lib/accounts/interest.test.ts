import { describe, expect, it } from 'vitest';
import { checkInterestDraft, EMPTY_INTEREST_DRAFT } from '~/components/accounts/accountDraft';
import {
  hasMatured,
  interestLine,
  interestPerPayment,
  interestScheduleText,
  nextMonthlyInterest,
  pendingInterest,
  previousInterestDate
} from './interest';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};
// The boards' today: a Friday, so the 3rd is tomorrow
const TODAY = day('2026-10-02');

// Counted up to the last payment, with nothing built up since
const monthly = (date: number, { next, since }: { next: string; since?: string }) => ({
  rate: 4.5,
  frequency: 'MONTHLY' as const,
  day: date,
  nextDate: day(next),
  accrued: 0,
  accruedTo: since ? day(since) : null,
  added: []
});

describe('savings interest', () => {
  it('spreads the AER over each payment, compounding', () => {
    expect(interestPerPayment(8650, { rate: 4.5, frequency: 'MONTHLY' })).toBe(31.79);
    expect(interestPerPayment(4200, { rate: 4.1, frequency: 'MONTHLY' })).toBe(14.09);
    expect(interestPerPayment(4200, { rate: 4.1, frequency: 'QUARTERLY' })).toBe(42.4);
    expect(interestPerPayment(1000, { rate: 5, frequency: 'YEARLY' })).toBe(50);
  });

  it('adds the days since it was counted to what’s built up, at a monthly payment’s share a day', () => {
    // 29 days of a monthly payment's share of 4.5%, spread over the year's days
    const isa = {
      balance: 8650,
      interest: monthly(3, { next: '2026-10-03', since: '2026-09-03' })
    };
    expect(pendingInterest(isa, TODAY)).toBe(30.31);
    expect(pendingInterest({ ...isa, interest: { ...isa.interest, accrued: 10 } }, TODAY)).toBe(
      40.31
    );
    // Counted to today: only what's built up
    expect(
      pendingInterest(
        { ...isa, interest: { ...isa.interest, accruedTo: TODAY, accrued: 5 } },
        TODAY
      )
    ).toBe(5);
  });

  it('finds a monthly payment’s next date after today, keeping a 31st in short months', () => {
    expect(nextMonthlyInterest(3, TODAY)).toEqual(day('2026-10-03'));
    expect(nextMonthlyInterest(2, TODAY)).toEqual(day('2026-11-02'));
    expect(nextMonthlyInterest(31, day('2026-11-02'))).toEqual(day('2026-11-30'));
  });

  it('counts interest so far from the payment before', () => {
    expect(previousInterestDate(monthly(3, { next: '2026-10-03' }))).toEqual(day('2026-09-03'));
    expect(previousInterestDate(monthly(31, { next: '2026-10-31' }))).toEqual(day('2026-09-30'));
    expect(
      previousInterestDate({
        rate: 5,
        frequency: 'MATURITY',
        day: 3,
        nextDate: day('2027-09-03'),
        accrued: 0,
        accruedTo: null,
        added: []
      })
    ).toBeNull();
  });

  it('says what’s built up and when it’s added, or when a fixed term has matured', () => {
    expect(
      interestLine(
        { balance: 8650, interest: monthly(3, { next: '2026-10-03', since: '2026-09-03' }) },
        TODAY
      )
    ).toEqual({
      tone: 'earning',
      short: 'Pending interest £30.31',
      when: 'Added tomorrow',
      since: day('2026-09-03'),
      added: 'tomorrow'
    });
    expect(
      interestLine(
        { balance: 4200, interest: monthly(1, { next: '2026-11-01', since: '2026-10-01' }) },
        TODAY
      )?.when
    ).toBe('Added Sun 1 Nov');
    const matured = {
      rate: 5,
      frequency: 'MATURITY' as const,
      day: 3,
      nextDate: null,
      accrued: 0,
      accruedTo: null,
      added: []
    };
    expect(hasMatured(matured)).toBe(true);
    expect(interestLine({ balance: 1000, interest: matured }, TODAY)?.tone).toBe('matured');
    // A rate on its own is shown only
    expect(
      interestLine(
        {
          balance: 1000,
          interest: {
            rate: 4,
            frequency: null,
            day: null,
            nextDate: null,
            accrued: 0,
            accruedTo: null,
            added: []
          }
        },
        TODAY
      )
    ).toBeNull();
  });

  it('says how often it’s paid', () => {
    expect(interestScheduleText(monthly(3, { next: '2026-10-03' }), TODAY)).toBe(
      'Monthly on the 3rd'
    );
    expect(
      interestScheduleText(
        {
          rate: 4,
          frequency: 'QUARTERLY',
          day: 1,
          nextDate: day('2026-12-01'),
          accrued: 0,
          accruedTo: null,
          added: []
        },
        TODAY
      )
    ).toBe('Every 3 months · next Tue 1 Dec');
  });
});

describe('interest as typed', () => {
  it('needs a rate and a day for monthly, and a date after today for the others', () => {
    const check = (fields: Partial<typeof EMPTY_INTEREST_DRAFT>) =>
      checkInterestDraft({ ...EMPTY_INTEREST_DRAFT, ...fields }, { today: TODAY });

    expect(check({}).input).toBeNull();
    expect(check({ rate: '4.5' }).input).toEqual({ rate: 4.5, frequency: null });
    expect(check({ frequency: 'MONTHLY', day: '3' }).errors.rate).toBe('Enter its rate');
    expect(check({ rate: '4.5', frequency: 'MONTHLY', day: '32' }).errors.day).toBe(
      'Choose a day from 1 to 31'
    );
    expect(check({ rate: '4.5', frequency: 'MONTHLY', day: '3' }).input).toEqual({
      rate: 4.5,
      frequency: 'MONTHLY',
      day: 3
    });
    expect(check({ rate: '4', frequency: 'YEARLY', nextDate: '2026-10-02' }).errors.nextDate).toBe(
      'Choose a date after today'
    );
    expect(check({ rate: '4', frequency: 'YEARLY', nextDate: '2027-03-01' }).input).toEqual({
      rate: 4,
      frequency: 'YEARLY',
      nextDate: '2027-03-01'
    });
  });

  it('lets a payment date that has since gone by stand when it’s unchanged', () => {
    const before = { rate: '4', frequency: 'YEARLY' as const, day: '', nextDate: '2026-09-01' };
    const { valid, unchanged } = checkInterestDraft(before, { today: TODAY, before });
    expect(valid).toBe(true);
    expect(unchanged).toBe(true);
  });
});
