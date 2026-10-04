import { addDays, daysBetween, isSameDay, toIsoDate } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { Payment } from './payments';
import { occurrencesBetween, PER_MONTH } from './recurrence';

/*
 * Whether a payment belongs to this pay cycle: due before the next payday and not skipped.
 * Payments already paid in an earlier cycle drop off, while overdue unpaid ones stay.
 */
export const isInCycle = (payment: Payment, cycle: PayCycle) =>
  payment.dueDate !== null &&
  payment.dueDate < cycle.end &&
  payment.state !== 'skipped' &&
  !(payment.state === 'paid' && payment.dueDate < cycle.start);

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
  const unpaid = inCycle.filter(payment => payment.state === 'unpaid');
  const upcomingNet = roundPence(unpaid.reduce((total, p) => total + p.signedAmount, 0));

  // Recurring money out that is still running, as a monthly figure; yearly ones are kept apart
  const activeOutgoings = payments.filter(
    payment => payment.kind === 'recurring' && payment.type === 'EXPENSE' && payment.dueDate
  );
  let monthlyRecurring = 0;
  let annualRecurring = 0;
  for (const payment of activeOutgoings) {
    if (payment.kind !== 'recurring') continue;
    if (payment.frequency === 'ANNUALLY') annualRecurring += payment.amount;
    else monthlyRecurring += payment.amount * PER_MONTH[payment.frequency];
  }
  monthlyRecurring = roundPence(monthlyRecurring);
  annualRecurring = roundPence(annualRecurring);

  const freeToSpend = roundPence(bankBalance + upcomingNet);
  const onPayday = roundPence(freeToSpend + monthlyIncome);
  const daysToPayday = Math.max(1, daysBetween(today, cycle.end));
  const recurringShare =
    monthlyIncome > 0 ? Math.min(100, (monthlyRecurring / monthlyIncome) * 100) : 100;

  return {
    inCycle,
    unpaidCount: unpaid.length,
    upcomingNet,
    freeToSpend,
    perDay: Math.max(0, freeToSpend) / daysToPayday,
    daysToPayday,
    onPayday,
    monthlyRecurring,
    annualRecurring,
    recurringCount: activeOutgoings.length,
    afterRecurring: roundPence(onPayday - monthlyRecurring),
    discretionary: roundPence(monthlyIncome - monthlyRecurring),
    recurringShare,
    dueToday: unpaid.find(payment => payment.dueDate && isSameDay(payment.dueDate, today))
  };
};

export type Summary = ReturnType<typeof summarise>;

export type CycleDayKind = 'past' | 'today' | 'income' | 'expense' | 'payday' | 'future';

export interface CycleDay {
  date: Date;
  kind: CycleDayKind;
  // Unpaid payments due that day
  payments: Payment[];
  isLastPayday: boolean;
}

/* A day-by-day view of the cycle for the progress bar, from the last payday to the next */
export const cycleDays = (cycle: PayCycle, today: Date, payments: Payment[]): CycleDay[] => {
  const due = new Map<string, Payment[]>();
  for (const payment of payments) {
    if (!payment.dueDate || payment.state !== 'unpaid' || !isInCycle(payment, cycle)) continue;
    // Anything overdue counts against today
    const key = toIsoDate(payment.dueDate < today ? today : payment.dueDate);
    due.set(key, [...(due.get(key) ?? []), payment]);
  }

  const total = daysBetween(cycle.start, cycle.end);
  return Array.from({ length: total + 1 }, (_, index) => {
    const date = addDays(cycle.start, index);
    const dayPayments = due.get(toIsoDate(date)) ?? [];
    const net = dayPayments.reduce((sum, p) => sum + p.signedAmount, 0);

    let kind: CycleDayKind = date < today ? 'past' : isSameDay(date, today) ? 'today' : 'future';
    if (date > today && dayPayments.length) kind = net < 0 ? 'expense' : 'income';
    if (index === total) kind = 'payday';

    return { date, kind, payments: dayPayments, isLastPayday: index === 0 };
  });
};

export interface CalendarDay {
  date: Date;
  inCycle: boolean;
  isToday: boolean;
  isPayday: boolean;
  // Every payment falling on the day, paid or not
  payments: Payment[];
}

/*
 * The calendar to payday: whole Monday-to-Sunday weeks from this week to payday's week, with each
 * recurring payment shown on every date it falls on.
 */
export const calendarDays = (cycle: PayCycle, today: Date, payments: Payment[]): CalendarDay[] => {
  const from = addDays(today, -((today.getDay() + 6) % 7));
  const to = addDays(cycle.end, (7 - cycle.end.getDay()) % 7);

  const onDay = new Map<string, Payment[]>();
  const add = (date: Date, payment: Payment) => {
    const key = toIsoDate(date);
    onDay.set(key, [...(onDay.get(key) ?? []), payment]);
  };
  for (const payment of payments) {
    if (payment.kind === 'recurring') {
      const schedule = {
        firstPaymentDate: payment.firstPaymentDate,
        frequency: payment.frequency,
        lastPaymentDate: payment.lastPaymentDate
      };
      occurrencesBetween(schedule, from, to).forEach(date => add(date, payment));
    } else if (payment.dueDate && payment.dueDate >= from && payment.dueDate <= to) {
      add(payment.dueDate, payment);
    }
  }

  return Array.from({ length: daysBetween(from, to) + 1 }, (_, index) => {
    const date = addDays(from, index);
    return {
      date,
      inCycle: date >= today && date <= cycle.end,
      isToday: isSameDay(date, today),
      isPayday: isSameDay(date, cycle.end),
      payments: onDay.get(toIsoDate(date)) ?? []
    };
  });
};
