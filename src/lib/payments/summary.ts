import { addDays, daysBetween, isSameDay, toIsoDate } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { datesDue, isInCycle } from './cycle';
import { Payment } from './payments';
import { PER_MONTH } from './recurrence';

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

interface SummaryInput {
  payments: Payment[];
  bankBalance: number;
  monthlyIncome: number;
  cycle: PayCycle;
  today: Date;
}

/* The dashboard's figures, worked out the way the design does */
export const summarise = ({ payments, bankBalance, monthlyIncome, cycle, today }: SummaryInput) => {
  const inCycle = payments.filter(payment => isInCycle(payment, cycle));
  // Every date still to pay counts, so a weekly payment counts each week before payday
  const dueCount = (payment: Payment) => datesDue(payment, cycle).length;
  const upcomingNet = roundPence(
    inCycle.reduce((total, p) => total + p.signedAmount * dueCount(p), 0)
  );
  // Recurring money out that is still running. Weekly, fortnightly and monthly payments make the
  // monthly total; quarterly and yearly ones are kept apart as a yearly total.
  const activeRecurring = payments.filter(
    payment => payment.kind === 'recurring' && payment.dueDate
  );
  let monthlyRecurring = 0;
  let annualRecurring = 0;
  // Weekly and fortnightly payments don't fall the same number of times each month, so they
  // count at their average a month. Negative for money out, like signedAmount.
  const averaged: { name: string; perMonth: number }[] = [];
  for (const payment of activeRecurring) {
    if (payment.kind !== 'recurring') continue;
    if (payment.frequency === 'ANNUALLY' || payment.frequency === 'QUARTERLY') {
      annualRecurring -= payment.signedAmount * PER_MONTH[payment.frequency] * 12;
      continue;
    }
    monthlyRecurring -= payment.signedAmount * PER_MONTH[payment.frequency];
    if (payment.frequency !== 'MONTHLY') {
      averaged.push({
        name: payment.name,
        perMonth: roundPence(payment.signedAmount * PER_MONTH[payment.frequency])
      });
    }
  }
  monthlyRecurring = roundPence(monthlyRecurring);
  annualRecurring = roundPence(annualRecurring);

  const freeToSpend = roundPence(bankBalance + upcomingNet);
  const onPayday = roundPence(freeToSpend + monthlyIncome);
  const daysToPayday = Math.max(1, daysBetween(today, cycle.end));
  const recurringShare =
    monthlyIncome > 0 ? Math.min(100, Math.max(0, (monthlyRecurring / monthlyIncome) * 100)) : 100;

  return {
    inCycle,
    unpaidCount: inCycle.reduce((count, p) => count + dueCount(p), 0),
    upcomingNet,
    freeToSpend,
    perDay: Math.max(0, freeToSpend) / daysToPayday,
    daysToPayday,
    onPayday,
    monthlyRecurring,
    annualRecurring,
    averagedRecurring: averaged,
    recurringCount: activeRecurring.length,
    afterRecurring: roundPence(onPayday - monthlyRecurring),
    discretionary: roundPence(monthlyIncome - monthlyRecurring),
    recurringShare,
    dueToday: inCycle.find(payment => payment.dueDate && isSameDay(payment.dueDate, today))
  };
};

export type Summary = ReturnType<typeof summarise>;

// 'ghost' days run on from a payday the user brought forward to the date it usually falls
export type CycleDayKind =
  'past' | 'today' | 'income' | 'expense' | 'payday' | 'future' | 'ghost' | 'ghostPayday';

export interface CycleDay {
  date: Date;
  kind: CycleDayKind;
  // Payments still to pay that day
  payments: Payment[];
  isLastPayday: boolean;
}

/*
 * A day-by-day view of the cycle for the progress bar, from the last payday to the next. When the
 * next payday has been brought forward, the days up to its usual date follow as ghosts.
 */
export const cycleDays = (cycle: PayCycle, today: Date, payments: Payment[]): CycleDay[] => {
  const due = new Map<string, Payment[]>();
  for (const payment of payments) {
    for (const date of datesDue(payment, cycle)) {
      // Anything overdue counts against today
      const key = toIsoDate(date < today ? today : date);
      due.set(key, [...(due.get(key) ?? []), payment]);
    }
  }

  const total = daysBetween(cycle.start, cycle.end);
  const usualTotal = Math.max(total, daysBetween(cycle.start, cycle.endUsual));
  return Array.from({ length: usualTotal + 1 }, (_, index) => {
    const date = addDays(cycle.start, index);
    if (index > total) {
      const kind = index === usualTotal ? 'ghostPayday' : 'ghost';
      return { date, kind, payments: [], isLastPayday: false };
    }
    const dayPayments = due.get(toIsoDate(date)) ?? [];
    const net = dayPayments.reduce((sum, p) => sum + p.signedAmount, 0);

    let kind: CycleDayKind = date < today ? 'past' : isSameDay(date, today) ? 'today' : 'future';
    if (date > today && dayPayments.length) kind = net < 0 ? 'expense' : 'income';
    if (index === total) kind = 'payday';

    return { date, kind, payments: dayPayments, isLastPayday: index === 0 };
  });
};
