import { describe, expect, it } from 'vitest';
import { checkInterestDraft, EMPTY_INTEREST_DRAFT } from '~/components/accounts/accountDraft';
import {
  hasMatured,
  interestForDays,
  interestLine,
  interestPerPayment,
  interestScheduleText,
  isInterestDue,
  nextMonthlyInterest,
  previousInterestDate
} from './interest';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};
// The boards' today: a Friday, so the 3rd is tomorrow
const TODAY = day('2026-10-02');

const monthly = (date: number, next: string) => ({
  rate: 4.5,
  frequency: 'MONTHLY' as const,
  day: date,
  nextDate: day(next)
});

describe('savings interest', () => {
  it('spreads the AER over each payment, compounding', () => {
    expect(interestPerPayment(8650, { rate: 4.5, frequency: 'MONTHLY' })).toBe(31.79);
    expect(interestPerPayment(4200, { rate: 4.1, frequency: 'MONTHLY' })).toBe(14.09);
    expect(interestPerPayment(4200, { rate: 4.1, frequency: 'QUARTERLY' })).toBe(42.4);
    expect(interestPerPayment(1000, { rate: 5, frequency: 'YEARLY' })).toBe(50);
  });

  it('works out what days earn at the daily rate', () => {
    expect(interestForDays(8650, { rate: 4.5, days: 29 })).toBe(30.25);
    expect(interestForDays(8650, { rate: 4.5, days: -3 })).toBe(0);
  });

  it('finds a monthly payment’s next date after today, keeping a 31st in short months', () => {
    expect(nextMonthlyInterest(3, TODAY)).toEqual(day('2026-10-03'));
    expect(nextMonthlyInterest(2, TODAY)).toEqual(day('2026-11-02'));
    expect(nextMonthlyInterest(31, day('2026-11-02'))).toEqual(day('2026-11-30'));
  });

  it('counts interest so far from the payment before', () => {
    expect(previousInterestDate(monthly(3, '2026-10-03'))).toEqual(day('2026-09-03'));
    expect(previousInterestDate(monthly(31, '2026-10-31'))).toEqual(day('2026-09-30'));
    expect(
      previousInterestDate({ rate: 5, frequency: 'MATURITY', day: 3, nextDate: day('2027-09-03') })
    ).toBeNull();
  });

  it('says what’s built up, what’s waiting to be checked, and when a fixed term has matured', () => {
    expect(interestLine({ balance: 8650, interest: monthly(3, '2026-10-03') }, TODAY)).toEqual({
      tone: 'earning',
      text: 'About £30.25 interest so far · paid tomorrow',
      short: 'About £30.25 so far',
      when: 'Paid tomorrow'
    });
    const easy = { ...monthly(1, '2026-10-01'), rate: 4.1 };
    expect(interestLine({ balance: 4200, interest: easy }, TODAY)).toEqual({
      tone: 'due',
      text: 'Interest paid Thu 1 Oct · about £14.09 to check',
      short: 'About £14.09 paid Thu 1 Oct',
      when: 'Check'
    });
    const matured = { rate: 5, frequency: 'MATURITY' as const, day: 3, nextDate: null };
    expect(hasMatured(matured)).toBe(true);
    expect(interestLine({ balance: 1000, interest: matured }, TODAY)?.tone).toBe('matured');
    // A rate on its own is shown only
    expect(
      interestLine(
        { balance: 1000, interest: { rate: 4, frequency: null, day: null, nextDate: null } },
        TODAY
      )
    ).toBeNull();
  });

  it('is due on its date and after, until it’s checked', () => {
    expect(isInterestDue(monthly(2, '2026-10-02'), TODAY)).toBe(true);
    expect(isInterestDue(monthly(3, '2026-10-03'), TODAY)).toBe(false);
    expect(isInterestDue(null, TODAY)).toBe(false);
  });

  it('says how often it’s paid', () => {
    expect(interestScheduleText(monthly(3, '2026-10-03'), TODAY)).toBe('Monthly on the 3rd');
    expect(
      interestScheduleText(
        { rate: 4, frequency: 'QUARTERLY', day: 1, nextDate: day('2026-12-01') },
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
