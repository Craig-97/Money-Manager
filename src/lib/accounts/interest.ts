import { InterestFrequency } from '~/graphql/generated';
import { daysBetween } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';

/*
 * A savings account's interest. With a frequency it's worked out each day on the balance and each
 * payment is checked before it's added; without one the rate is shown only.
 */
export interface AccountInterest {
  // AER, as a percentage
  rate: number;
  frequency: InterestFrequency | null;
  // The day of the month it's paid on
  day: number | null;
  // When it's next paid. None once a fixed-term account has matured.
  nextDate: Date | null;
}

// Payments a year, to spread the AER over
const PER_YEAR: Record<InterestFrequency, number> = {
  MONTHLY: 12,
  QUARTERLY: 4,
  YEARLY: 1,
  // A fixed term pays once; its estimate is for a year of it
  MATURITY: 1
};

// Months from one payment to the next
const MONTHS: Record<InterestFrequency, number | null> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12,
  MATURITY: null
};

export const FREQUENCY_NAMES: Record<InterestFrequency, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Every 3 months',
  YEARLY: 'Once a year',
  MATURITY: 'At maturity'
};

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

/* One payment: the AER spread over the year, compounding, so it's within pennies of the bank's */
export const interestPerPayment = (
  balance: number,
  { rate, frequency }: { rate: number; frequency: InterestFrequency }
) => roundPence(balance * ((1 + rate / 100) ** (1 / PER_YEAR[frequency]) - 1));

/* What a number of days earns, at the daily rate the AER gives */
export const interestForDays = (balance: number, { rate, days }: { rate: number; days: number }) =>
  roundPence(balance * ((1 + rate / 100) ** (1 / 365) - 1) * Math.max(0, days));

/* The given day in a month, or its last day when it's shorter: the 31st falls on 30 Sep */
const dayInMonth = ({ year, month, day }: { year: number; month: number; day: number }) =>
  new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));

/* A monthly payment's next date after today, on its day, as the API works it out */
export const nextMonthlyInterest = (day: number, today: Date) => {
  const thisMonth = dayInMonth({ year: today.getFullYear(), month: today.getMonth(), day });
  return thisMonth > today
    ? thisMonth
    : dayInMonth({ year: today.getFullYear(), month: today.getMonth() + 1, day });
};

/* The payment before the next one, which interest so far counts from. None for a fixed term. */
export const previousInterestDate = (interest: AccountInterest) => {
  const months = interest.frequency ? MONTHS[interest.frequency] : null;
  if (!months || !interest.nextDate) return null;
  const { nextDate } = interest;
  return dayInMonth({
    year: nextDate.getFullYear(),
    month: nextDate.getMonth() - months,
    day: interest.day ?? nextDate.getDate()
  });
};

/* A payment's date has come, so it's waiting to be checked */
export const isInterestDue = (interest: AccountInterest | null, today: Date) =>
  !!interest?.frequency && !!interest.nextDate && interest.nextDate <= today;

/* A fixed-term account that has paid out: time to set a new term or say it's done */
export const hasMatured = (interest: AccountInterest | null) =>
  interest?.frequency === 'MATURITY' && !interest.nextDate;

/* "Monthly on the 3rd", "Every 3 months · next Tue 1 Dec", "At maturity · Fri 3 Sep 2027" */
export const interestScheduleText = (interest: AccountInterest, today: Date) => {
  if (!interest.frequency) return 'Not set up';
  if (interest.frequency === 'MONTHLY' && interest.day) {
    return `Monthly on the ${ordinal(interest.day)}`;
  }
  if (!interest.nextDate) return 'Matured';
  return `${FREQUENCY_NAMES[interest.frequency]} · ${interest.frequency === 'MATURITY' ? '' : 'next '}${formatShortDate(interest.nextDate, today)}`;
};

export const ordinal = (n: number) =>
  `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : (({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th')}`;

export type InterestTone = 'earning' | 'due' | 'matured';

/*
 * What an account's row and view say about its interest: what's waiting to be checked, what's
 * built up so far and when it's paid, or that a fixed term has matured. Null without a schedule.
 * `short` and `when` are the two ends of the mobile strip; `text` is the desktop line.
 */
export const interestLine = (
  account: { balance: number; interest: AccountInterest | null },
  today: Date
): { tone: InterestTone; text: string; short: string; when: string } | null => {
  const { interest } = account;
  if (!interest?.frequency) return null;
  if (hasMatured(interest)) {
    return {
      tone: 'matured',
      text: 'Matured · set a new term or say it no longer earns interest',
      short: 'Matured',
      when: 'Choose'
    };
  }
  const nextDate = interest.nextDate!;
  const each = formatMoney(
    interestPerPayment(account.balance, { rate: interest.rate, frequency: interest.frequency })
  );
  if (isInterestDue(interest, today)) {
    const paid = formatShortDate(nextDate, today);
    return {
      tone: 'due',
      text: `Interest paid ${paid} · about ${each} to check`,
      short: `About ${each} paid ${paid}`,
      when: 'Check'
    };
  }
  const days = daysBetween(today, nextDate);
  const when = days === 1 ? 'tomorrow' : formatShortDate(nextDate, today);
  if (interest.frequency === 'MATURITY') {
    return {
      tone: 'earning',
      text: `About ${each} a year · paid when it matures, ${when}`,
      short: `About ${each} a year`,
      when: `Matures ${when}`
    };
  }
  const since = previousInterestDate(interest);
  const soFar = formatMoney(
    interestForDays(account.balance, {
      rate: interest.rate,
      days: since ? daysBetween(since, today) : 0
    })
  );
  return {
    tone: 'earning',
    text: `About ${soFar} interest so far · paid ${when}`,
    short: `About ${soFar} so far`,
    when: `Paid ${when}`
  };
};
