import {
  OneOffPaymentCategory,
  PaymentFrequency,
  RecurringPaymentCategory
} from '~/graphql/generated';
import { formatDayMonth, formatShortDay } from '~/lib/dates';

/* "HOME_MAINTENANCE" -> "Home maintenance" */
export const categoryLabel = (category: string) => {
  const words = category.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Fortnightly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  ANNUALLY: 'Annually'
};

export const FREQUENCIES = Object.keys(FREQUENCY_LABELS) as PaymentFrequency[];

// In the order the design lists them
export const RECURRING_CATEGORIES: RecurringPaymentCategory[] = [
  'MORTGAGE',
  'RENT',
  'UTILITIES',
  'HOME_MAINTENANCE',
  'TAX',
  'VEHICLE',
  'TRANSPORT',
  'LOAN',
  'CREDIT_CARD',
  'SAVINGS',
  'INVESTMENT',
  'INSURANCE',
  'HEALTHCARE',
  'CHILDCARE',
  'EDUCATION',
  'SUBSCRIPTION',
  'MEMBERSHIP',
  'FOOD',
  'CHARITY',
  'BUSINESS',
  'OTHER'
];

export const ONE_OFF_CATEGORIES: OneOffPaymentCategory[] = [
  'TRANSFER',
  'INVESTMENT',
  'FEES',
  'TAXES',
  'HOME',
  'UTILITIES',
  'VEHICLE',
  'TRAVEL',
  'TRANSPORT',
  'FOOD',
  'SHOPPING',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'EDUCATION',
  'GIFT',
  'PETS',
  'SALARY',
  'BUSINESS',
  'CHARITY',
  'OTHER'
];

const weekdayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });

/* 1 -> "1st", 22 -> "22nd" */
export const ordinal = (n: number) => {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suffix}`;
};

/*
 * How a recurring payment repeats: "Monthly on the 2nd", "Every other Friday". The lower-case
 * form reads inside a sentence: "Repeats monthly on the 2nd".
 */
export const scheduleText = (first: Date, frequency: PaymentFrequency, { lower = false } = {}) => {
  const weekday = weekdayName.format(first);
  const day = ordinal(first.getDate());
  const text = {
    WEEKLY: lower ? `every ${weekday}` : `Weekly on ${weekday}s`,
    BIWEEKLY: `${lower ? 'every' : 'Every'} other ${weekday}`,
    MONTHLY: `${lower ? 'monthly' : 'Monthly'} on the ${day}`,
    QUARTERLY: `${lower ? 'every' : 'Every'} 3 months on the ${day}`,
    ANNUALLY: lower
      ? `every year on ${formatDayMonth(first)}`
      : `Annually on ${formatDayMonth(first)}`
  };
  return text[frequency];
};

/* "Fri 9 Oct", with the year when it isn't this year: "Thu 1 Jul 2027" */
export const formatShortDate = (date: Date, today = new Date()) =>
  formatShortDay(date, { withYear: date.getFullYear() !== today.getFullYear() });
