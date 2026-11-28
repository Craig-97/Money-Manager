import { useState } from 'react';

// Example payments for the hero's demo. `amount` is signed: money in is positive.
const PAYMENTS = [
  { key: 'shopping', name: 'Shopping', sub: 'One-off · Fri 9 Oct', amount: 10, day: 14 },
  { key: 'birthday', name: 'Birthday', sub: 'One-off · Tue 20 Oct', amount: -75, day: 25 },
  { key: 'mortgage', name: 'Mortgage', sub: 'Monthly · Wed 28 Oct', amount: -750, day: 33 }
] as const;

const BANK_BALANCE = 10_000;
const DAYS_TO_PAYDAY = 28;
// The cycle bar: a segment per day, with today at TODAY and payday the last
const SEGMENTS = 36;
const TODAY = 7;

export type SegmentKind = 'past' | 'today' | 'income' | 'expense' | 'payday' | 'future';

/*
 * The hero's "Due before payday" demo: ticking a payment off takes it out of what's upcoming,
 * which changes free to spend and the cycle bar.
 */
export const useDueDemo = () => {
  const [paid, setPaid] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = (key: string) =>
    setPaid(current => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const unpaid = PAYMENTS.filter(payment => !paid.has(payment.key));
  const upcoming = unpaid.reduce((total, payment) => total + payment.amount, 0);
  const freeToSpend = BANK_BALANCE + upcoming;

  const segments = Array.from({ length: SEGMENTS }, (_, day): SegmentKind => {
    if (day === SEGMENTS - 1) return 'payday';
    if (day < TODAY) return 'past';
    if (day === TODAY) return 'today';
    const due = unpaid.find(payment => payment.day === day);
    if (due) return due.amount < 0 ? 'expense' : 'income';
    return 'future';
  });

  return {
    payments: PAYMENTS.map(payment => ({ ...payment, paid: paid.has(payment.key) })),
    toggle,
    bankBalance: BANK_BALANCE,
    upcoming,
    freeToSpend,
    perDay: Math.round(Math.max(0, freeToSpend) / DAYS_TO_PAYDAY),
    daysToPayday: DAYS_TO_PAYDAY,
    unpaidCount: unpaid.length,
    segments
  };
};
