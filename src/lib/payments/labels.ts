import { PaymentCategory, PaymentFrequency, PaymentType } from '~/graphql/generated';
import { formatDayMonth, formatLongWeekday } from '~/lib/dates';
import { capitalise, ordinal } from '~/lib/format';

/* "HOME_MAINTENANCE" -> "Home maintenance" */
export const categoryLabel = (category: string) => {
  return capitalise(category.toLowerCase().replace(/_/g, ' '));
};

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Fortnightly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUALLY: 'Every 6 months',
  ANNUALLY: 'Annually'
};

export const FREQUENCIES = Object.keys(FREQUENCY_LABELS) as PaymentFrequency[];

// One list for one-off and recurring payments, A–Z as Monzo lists them
const PAYMENT_CATEGORIES: PaymentCategory[] = [
  'BILLS',
  'CHARITY',
  'EATING_OUT',
  'ENTERTAINMENT',
  'EXPENSES',
  'FAMILY',
  'FINANCES',
  'GENERAL',
  'GIFTS',
  'GROCERIES',
  'HOLIDAYS',
  'INCOME',
  'PERSONAL_CARE',
  'SAVINGS',
  'SHOPPING',
  'SUBSCRIPTIONS',
  'TRANSFERS',
  'TRANSPORT'
];

// Money coming in is pay, a transfer, a gift, expenses paid back, or something else
const INCOME_CATEGORIES: PaymentCategory[] = [
  'INCOME',
  'TRANSFERS',
  'GIFTS',
  'EXPENSES',
  'GENERAL'
];

/* The categories that make sense for money in or money out */
export const categoriesFor = (type: PaymentType) =>
  type === 'INCOME'
    ? PAYMENT_CATEGORIES.filter(category => INCOME_CATEGORIES.includes(category))
    : PAYMENT_CATEGORIES.filter(category => category !== 'INCOME');

/* 1 -> "1st", 22 -> "22nd" */
/*
 * How a recurring payment repeats: "Monthly on the 2nd", "Every other Friday". The lower-case
 * form reads inside a sentence: "Repeats monthly on the 2nd".
 */
export const scheduleText = (
  first: Date,
  { frequency, lower = false }: { frequency: PaymentFrequency; lower?: boolean }
) => {
  const weekday = formatLongWeekday(first);
  const day = ordinal(first.getDate());
  const text = {
    WEEKLY: lower ? `every ${weekday}` : `Weekly on ${weekday}s`,
    BIWEEKLY: `${lower ? 'every' : 'Every'} other ${weekday}`,
    MONTHLY: `${lower ? 'monthly' : 'Monthly'} on the ${day}`,
    QUARTERLY: `${lower ? 'every' : 'Every'} 3 months on the ${day}`,
    BIANNUALLY: `${lower ? 'every' : 'Every'} 6 months on the ${day}`,
    ANNUALLY: lower
      ? `every year on ${formatDayMonth(first)}`
      : `Annually on ${formatDayMonth(first)}`
  };
  return text[frequency];
};
