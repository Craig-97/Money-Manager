import { formatShortDay, PaydayConfig, toIsoDate } from '~/lib/dates';
import { formatMoney, MINUS } from '~/lib/format';
import { BankHolidays, getPaydayDates, getPaydays } from '~/lib/payday';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const PROJECTION_MONTHS = 12;
export const TABLE_MONTHS = 24;

/* "+£2,600" or "−£400" */
export const signedMoney = (amount: number, options?: { whole?: boolean }) =>
  (amount < 0 ? MINUS : '+') + formatMoney(amount, options);

/* "+28.4%" or "−3.1%" */
export const signedPercent = (value: number, digits = 1) =>
  (value < 0 ? MINUS : '+') + Math.abs(value).toFixed(digits) + '%';

/* A starting spend for the slider: the recurring total rounded up to the next £500 */
export const defaultSpend = (recurring: number, income: number) =>
  Math.min(income, Math.max(500, Math.ceil(recurring / 500) * 500));

interface ProjectionInput {
  // What's free to spend now: the projection's starting point
  start: number;
  income: number;
  spend: number;
  recurring: number;
}

/* Where the balance goes month by month at a monthly spend, against recurring payments alone */
export const project = ({ start, income, spend, recurring }: ProjectionInput) => {
  const net = income - spend;
  const recurringNet = income - recurring;
  const atSpend = Array.from({ length: PROJECTION_MONTHS + 1 }, (_, i) => start + net * i);
  const recurringOnly = Array.from(
    { length: PROJECTION_MONTHS + 1 },
    (_, i) => start + recurringNet * i
  );
  const inAYear = atSpend[PROJECTION_MONTHS];

  return {
    net,
    atSpend,
    recurringOnly,
    inAYear,
    // As a share of today's figure; there's no sensible percentage from nothing
    growthPercent: start > 0 ? (net / start) * 100 : null,
    yearPercent: start > 0 ? ((inAYear - start) / start) * 100 : null
  };
};

const STEPS = [500, 1000, 2000, 5000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000];

/* Round numbers for the chart's gridlines, covering every value with at most six lines */
export const chartScale = (values: number[]) => {
  const top = Math.max(...values, 0);
  const bottom = Math.min(...values, 0);
  const step = STEPS.find(s => Math.ceil(top / s) - Math.floor(bottom / s) <= 5) ?? STEPS.at(-1)!;
  const max = Math.max(step, Math.ceil(top / step) * step);
  const min = Math.floor(bottom / step) * step;
  const lines = [];
  for (let value = min; value <= max; value += step) lines.push(value);
  return { min, max, lines };
};

/* "£0", "£10k", "−£5k" */
export const axisLabel = (value: number) =>
  value === 0
    ? '£0'
    : (value < 0 ? MINUS : '') +
      '£' +
      (Math.abs(value) >= 1000 ? `${Math.abs(value) / 1000}k` : String(Math.abs(value)));

/* The helper under the spend field, comparing it with recurring payments */
export const spendHelper = (spend: number, recurring: number) => {
  const diff = spend - recurring;
  if (diff > 0) return `you’d spend ${formatMoney(diff, { whole: true })} more each month.`;
  if (diff < 0) {
    return `that’s ${formatMoney(-diff, { whole: true })} more than you’d spend each month, so check nothing’s missing.`;
  }
  return 'you’d spend exactly that each month.';
};

/* How the chosen spend compares with paying recurring payments alone over a year */
export const impactText = (spend: number, recurring: number) => {
  const diff = spend - recurring;
  if (diff > 0) {
    return `Spending ${formatMoney(diff, { whole: true })} a month above your recurring payments leaves you ${formatMoney(diff * 12, { whole: true })} lower after 12 months than covering recurring payments alone.`;
  }
  if (diff < 0) {
    return `At this pace you’d finish 12 months ${formatMoney(-diff * 12, { whole: true })} ahead of a recurring-payments-only budget.`;
  }
  return 'You’re spending exactly your recurring payments, so both lines match.';
};

export interface MonthRow {
  month: string;
  isNow: boolean;
  payday: Date | null;
  // Moved by a bank holiday (weekends alone don't count) or by the user, from this date
  movedFrom: Date | null;
  movedBy: 'bank holiday' | 'you' | null;
  balance: number;
  // Percentage change on the month before; null for the first month
  change: number | null;
}

interface RowsInput {
  today: Date;
  start: number;
  net: number;
  income: number;
  // Show the balance just after each payday rather than just before
  afterPayday: boolean;
  payday: PaydayConfig;
  holidays: BankHolidays;
}

/* The month-by-month table: each month's payday and the balance around it */
export const monthRows = ({
  today,
  start,
  net,
  income,
  afterPayday,
  payday,
  holidays
}: RowsInput): MonthRow[] => {
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const last = new Date(today.getFullYear(), today.getMonth() + TABLE_MONTHS, 0);
  const paydays = getPaydayDates(payday, holidays, first, last);
  const nominal = getPaydays({ ...payday, overrides: [] }, new Set(), first, last);
  const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
  const byMonth = new Map<
    string,
    { actual: Date; usual: Date | null; nominal: Date | undefined }
  >();
  paydays.forEach(({ date: actual, usual }, index) => {
    if (!byMonth.has(monthKey(actual)))
      byMonth.set(monthKey(actual), { actual, usual, nominal: nominal[index] });
  });

  const value = (i: number) => start + net * i + (afterPayday ? income : 0);
  return Array.from({ length: TABLE_MONTHS }, (_, i) => {
    const month = new Date(first.getFullYear(), first.getMonth() + i, 1);
    const found = byMonth.get(monthKey(month));
    const heldBack =
      found && found.nominal && toIsoDate(found.nominal) !== toIsoDate(found.actual)
        ? found.nominal
        : null;
    const movedFrom = found?.usual ?? heldBack;
    const previous = i ? value(i - 1) : 0;
    return {
      month: `${MONTHS[month.getMonth()]} ${month.getFullYear()}`,
      isNow: i === 0,
      payday: found?.actual ?? null,
      movedFrom,
      movedBy: found?.usual ? 'you' : movedFrom ? 'bank holiday' : null,
      balance: value(i),
      change: i && previous !== 0 ? (net / Math.abs(previous)) * 100 : null
    };
  });
};

export const movedTitle = (row: MonthRow) =>
  row.movedFrom
    ? `Moved from ${formatShortDay(row.movedFrom)} ${row.movedBy === 'you' ? 'by you' : '(bank holiday)'}`
    : '';
