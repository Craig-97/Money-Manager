import { InterestFrequency } from '~/graphql/generated';
import { dayInMonth, daysBetween, formatShortDate } from '../dates';
import { formatMoney, ordinal, roundPence } from '../format';

// A payment the app added on its own, to check against the bank
interface InterestAdded {
  date: Date;
  amount: number;
  balanceAfter: number;
}

/*
 * A savings account's interest. With a frequency it's worked out on each day's closing balance and
 * added on the day it's paid; without one the rate is shown only.
 */
export interface AccountInterest {
  // AER, as a percentage
  rate: number;
  frequency: InterestFrequency | null;
  // The day of the month it's paid on
  day: number | null;
  // When it's next paid. None once a fixed-term account has matured.
  nextDate: Date | null;
  // Built up since it was last paid, unrounded, counted up to the start of accruedTo
  accrued: number;
  accruedTo: Date | null;
  // Payments added since the balance was last typed in, oldest first
  added: InterestAdded[];
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

/* One payment: the AER spread over the year, compounding, so it's within pennies of the bank's */
export const interestPerPayment = (
  balance: number,
  { rate, frequency }: { rate: number; frequency: InterestFrequency }
) => roundPence(balance * ((1 + rate / 100) ** (1 / PER_YEAR[frequency]) - 1));

/*
 * A day's interest, as the API works it out: each payment's share of the AER, compounding, spread
 * evenly over the days it covers
 */
const dailyInterest = (
  balance: number,
  { rate, frequency }: { rate: number; frequency: InterestFrequency }
) =>
  (Math.max(0, balance) *
    PER_YEAR[frequency] *
    ((1 + rate / 100) ** (1 / PER_YEAR[frequency]) - 1)) /
  365;

/*
 * What's built up since the last payment, rounded: what the API has counted, then each day since at
 * today's balance. Today isn't over, so it doesn't count yet. None without a schedule.
 */
export const pendingInterest = (
  account: { balance: number; interest: AccountInterest | null },
  today: Date
) => {
  const { interest } = account;
  if (!interest?.frequency || !interest.nextDate) return null;
  const days = interest.accruedTo ? Math.max(0, daysBetween(interest.accruedTo, today)) : 0;
  return roundPence(
    interest.accrued +
      dailyInterest(account.balance, { rate: interest.rate, frequency: interest.frequency }) * days
  );
};

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

/* "An estimate worked out on each day’s balance since Sat 26 Sep." */
export const estimateText = (since: Date | null | undefined, today: Date) =>
  `An estimate worked out on each day’s balance${since ? ` since ${formatShortDate(since, today)}` : ''}.`;

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

type InterestTone = 'earning' | 'matured';

/*
 * What an account's row and view say about its interest: what's built up and when it's added, or
 * that a fixed term has matured. Null without a schedule. `short` and `when` are the two ends of
 * the phone's strip; the desktop row's tag says `short`, with `since` and `added` in its tooltip.
 */
export const interestLine = (
  account: { balance: number; interest: AccountInterest | null },
  today: Date
): {
  tone: InterestTone;
  short: string;
  when: string;
  // The last payment, which what's built up counts from; none for a fixed term
  since: Date | null;
  // "tomorrow", "Sun 1 Nov"
  added: string;
} | null => {
  const { interest } = account;
  if (!interest?.frequency) return null;
  if (!interest.nextDate) {
    return {
      tone: 'matured',
      short: 'Matured · set a new term or say it no longer earns interest',
      when: 'Choose',
      since: null,
      added: ''
    };
  }
  const days = daysBetween(today, interest.nextDate);
  const added =
    days <= 0 ? 'today' : days === 1 ? 'tomorrow' : formatShortDate(interest.nextDate, today);
  return {
    tone: 'earning',
    short: `Pending interest ${formatMoney(pendingInterest(account, today) ?? 0)}`,
    when: `Added ${added}`,
    since: previousInterestDate(interest),
    added
  };
};
