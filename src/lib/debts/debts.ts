import { PER_MONTH, RecurringPayment } from '~/lib/payments';

/*
 * Payoff estimates for the Debts page. Everything works month by month: each month a debt gets its
 * interest (balance × APR ÷ 12) and then its payment, with weekly or yearly payments counted at
 * their monthly average. They're estimates from the APR; a statement is the final word.
 */

// A recurring payment that's paying off a debt
export type DebtPayment = RecurringPayment & { debt: NonNullable<RecurringPayment['debt']> };

export const isDebt = (payment: RecurringPayment): payment is DebtPayment => payment.debt !== null;

// What a payoff estimate needs from a debt, so a form can work one out before it's saved
export type PayoffDebt = Pick<DebtPayment, 'id' | 'amount' | 'frequency'> & {
  debt: Pick<DebtPayment['debt'], 'balance' | 'apr'>;
};

// What happens to a debt's payment once the debt is cleared
export type PayoffStrategy =
  // It moves to the debt with the highest rate: the least interest overall
  | 'avalanche'
  // It moves to the smallest balance: debts are cleared soonest
  | 'snowball'
  // It stops, and the money goes back into free to spend
  | 'keep';

// What one payment puts towards its debt in an average month
export const monthlyPayment = (debt: PayoffDebt) => debt.amount * PER_MONTH[debt.frequency];

/* The order debts are paid off in, which is where freed-up payments and any extra go */
export const payoffOrder = (debts: readonly PayoffDebt[], strategy: PayoffStrategy) => {
  if (strategy === 'keep') return debts.map(debt => debt.id);
  return debts
    .toSorted((a, b) =>
      strategy === 'avalanche'
        ? b.debt.apr - a.debt.apr || a.debt.balance - b.debt.balance
        : a.debt.balance - b.debt.balance || b.debt.apr - a.debt.apr
    )
    .map(debt => debt.id);
};

// Debts that would take longer than this are treated as never clearing
const MAX_MONTHS = 50 * 12;

export interface Payoff {
  // Months until everything is cleared, or null if it never would be at these payments
  months: number | null;
  // Interest paid along the way
  interest: number;
  // When each debt is cleared, in months from now; null for one that never would be
  clearedIn: Record<string, number | null>;
  // The total left at the start and after each month, for a chart
  series: number[];
}

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

/*
 * Pays the debts off month by month. `extra` is paid on top each month, to the first debt in the
 * order that still has something left. With a strategy other than keep, a cleared debt's payment
 * joins the extra.
 */
export const simulatePayoff = (
  debts: readonly PayoffDebt[],
  { extra = 0, strategy = 'keep' }: { extra?: number; strategy?: PayoffStrategy } = {}
): Payoff => {
  const left = new Map(debts.map(debt => [debt.id, debt.debt.balance]));
  const order = payoffOrder(debts, strategy);
  const clearedIn: Record<string, number | null> = Object.fromEntries(
    debts.map(debt => [debt.id, debt.debt.balance <= 0 ? 0 : null])
  );
  const total = () => [...left.values()].reduce((sum, balance) => sum + balance, 0);
  const series = [roundPence(total())];
  let interest = 0;
  let month = 0;

  while (total() > 0.005 && month < MAX_MONTHS) {
    month += 1;
    let pool = extra;
    for (const debt of debts) {
      const balance = left.get(debt.id)!;
      const payment = monthlyPayment(debt);
      if (balance <= 0.005) {
        // Cleared: its payment carries on to the next debt, unless it's kept as free to spend
        if (strategy !== 'keep') pool += payment;
        continue;
      }
      const monthInterest = (balance * debt.debt.apr) / 100 / 12;
      interest += monthInterest;
      const paid = Math.min(payment, balance + monthInterest);
      left.set(debt.id, balance + monthInterest - paid);
      // The last payment is often smaller; what's over carries on like a cleared debt's
      if (strategy !== 'keep') pool += payment - paid;
    }
    for (const id of order) {
      if (pool <= 0) break;
      const balance = left.get(id)!;
      if (balance <= 0.005) continue;
      const paid = Math.min(pool, balance);
      left.set(id, balance - paid);
      pool -= paid;
    }
    for (const [id, balance] of left) {
      if (balance <= 0.005 && clearedIn[id] === null) clearedIn[id] = month;
    }
    series.push(roundPence(Math.max(0, total())));
  }

  return {
    months: total() > 0.005 ? null : month,
    interest: roundPence(interest),
    clearedIn,
    series
  };
};

/* The month a number of months from now falls in: its first day */
export const monthFromNow = (today: Date, months: number) =>
  new Date(today.getFullYear(), today.getMonth() + months, 1);

export interface DebtTotals {
  // What's left to pay across them all
  left: number;
  // What was borrowed: each debt's starting balance, or its balance now when that isn't known
  started: number;
  // How much of what was borrowed has been paid off
  paidOff: number;
  // Paid off as a share of what was borrowed, 0 to 1
  paidOffShare: number;
  // What they cost in an average month
  monthly: number;
}

export const debtTotals = (debts: readonly DebtPayment[]): DebtTotals => {
  let left = 0;
  let started = 0;
  let monthly = 0;
  for (const debt of debts) {
    left += debt.debt.balance;
    started += Math.max(debt.debt.startingBalance ?? debt.debt.balance, debt.debt.balance);
    monthly += monthlyPayment(debt);
  }
  const paidOff = started - left;
  return {
    left: roundPence(left),
    started: roundPence(started),
    paidOff: roundPence(paidOff),
    paidOffShare: started > 0 ? paidOff / started : 0,
    monthly: roundPence(monthly)
  };
};

/* What was borrowed: the starting balance, or the balance now when that isn't known or is lower */
export const startedAt = (debt: DebtPayment) =>
  Math.max(debt.debt.startingBalance ?? debt.debt.balance, debt.debt.balance);

/* How much of what was borrowed is paid off, 0 to 1 */
export const paidOffShare = (debt: DebtPayment) => {
  const started = startedAt(debt);
  return started > 0 ? (started - debt.debt.balance) / started : 0;
};

/* About how much of this month's payments goes on interest, from each debt's APR */
export const monthlyInterest = (debts: readonly PayoffDebt[]) =>
  roundPence(debts.reduce((sum, debt) => sum + (debt.debt.balance * debt.debt.apr) / 100 / 12, 0));

/* How much less the debts owe since payday, from payments marked paid and overpayments */
export const paidOffThisCycle = (debts: readonly DebtPayment[]) =>
  roundPence(debts.reduce((sum, debt) => sum + debt.debt.paidOffThisCycle, 0));

/*
 * Extra a month as an amount on each of a debt's payments, so a weekly debt gets a quarter or so of
 * it each week. Rounded to the penny.
 */
export const extraPerPayment = (debt: Pick<DebtPayment, 'frequency'>, extraPerMonth: number) =>
  roundPence(extraPerMonth / PER_MONTH[debt.frequency]);
