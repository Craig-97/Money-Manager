import { isSameDay } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { datesDue, Payment } from '~/lib/payments';
import { Account, accountOf } from './accounts';

/*
 * What each account has left by payday once its own payments go out: the Accounts page's Before
 * payday view. A payment that moves money between accounts goes out of one and into the other, so
 * the total across them doesn't change.
 */

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

export interface Movement {
  // The payment and date, so each date of a weekly payment has its own row
  key: string;
  payment: Payment;
  date: Date;
  // Negative for money out of this account
  amount: number;
  // For money moving between accounts, the account at the other end
  other: Account | null;
}

export interface AccountBeforePayday {
  account: Account;
  // Still to come before payday, oldest first
  movements: Movement[];
  goesOut: number;
  comesIn: number;
  left: number;
  // The lowest the balance gets before payday, and when; null with nothing to come
  lowest: { amount: number; date: Date } | null;
  // Money moving on payday itself, which counts in the next cycle
  onPayday: Movement[];
}

const movement = (
  payment: Payment,
  { date, amount, other }: { date: Date; amount: number; other: Account | null }
): Movement => ({ key: `${payment.id}:${date.getTime()}`, payment, date, amount, other });

export const beforePaydayByAccount = (
  accounts: readonly Account[],
  { payments, cycle }: { payments: readonly Payment[]; cycle: PayCycle }
): AccountBeforePayday[] => {
  const moves = new Map(accounts.map(account => [account.id, [] as Movement[]]));
  const onPayday = new Map(accounts.map(account => [account.id, [] as Movement[]]));

  for (const payment of payments) {
    const from = accountOf(payment, accounts);
    const into =
      payment.kind === 'recurring' && payment.paysInto
        ? (accounts.find(account => account.id === payment.paysInto) ?? null)
        : null;
    for (const date of datesDue(payment, cycle)) {
      if (from)
        moves
          .get(from.id)!
          .push(movement(payment, { date, amount: payment.signedAmount, other: into }));
      if (into)
        moves.get(into.id)!.push(movement(payment, { date, amount: payment.amount, other: from }));
    }
    // A transfer on payday itself, like a top-up when pay lands
    if (into && from && payment.dueDate && isSameDay(payment.dueDate, cycle.end)) {
      const date = payment.dueDate;
      onPayday
        .get(from.id)!
        .push(movement(payment, { date, amount: -payment.amount, other: into }));
      onPayday.get(into.id)!.push(movement(payment, { date, amount: payment.amount, other: from }));
    }
  }

  return accounts.map(account => {
    const movements = moves
      .get(account.id)!
      .toSorted((a, b) => a.date.getTime() - b.date.getTime());
    let running = account.balance;
    let lowest: AccountBeforePayday['lowest'] = null;
    for (const item of movements) {
      running = roundPence(running + item.amount);
      if (!lowest || running < lowest.amount) lowest = { amount: running, date: item.date };
    }
    const sum = (sign: 1 | -1) =>
      roundPence(
        movements
          .filter(item => item.amount * sign > 0)
          .reduce((total, item) => total + item.amount * sign, 0)
      );
    return {
      account,
      movements,
      goesOut: sum(-1),
      comesIn: sum(1),
      left: running,
      lowest,
      onPayday: onPayday.get(account.id)!
    };
  });
};

/* Whether an account's balance would go below £0 before money comes in */
export const goesBelowZero = (row: Pick<AccountBeforePayday, 'lowest'>) =>
  !!row.lowest && row.lowest.amount < 0;
