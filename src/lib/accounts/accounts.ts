import { AccountFieldsFragment, AccountKind } from '~/graphql/generated';
import { daysBetween, fromApiDate } from '~/lib/dates';
import { roundPence } from '~/lib/format';
import { AccountInterest } from './interest';

/*
 * A budget's bank accounts: ones to spend from, one of them where pay lands, and any savings.
 * Balances are typed in, never linked to a bank. The bank balance on the dashboard is the ones that
 * count in free to spend, added up.
 */

export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  balance: number;
  counts: boolean;
  // Where pay lands, and where payments that don't name an account go out of
  paidInto: boolean;
  // Savings only: its rate, and when it's paid once that's been said
  interest: AccountInterest | null;
  purpose: string | null;
  // The day the balance was last typed in
  balanceUpdatedAt: Date;
}

// A balance not typed in for this long may well be out of date, so it's flagged and reminded about
export const STALE_DAYS = 28;

export const toAccounts = (
  accounts: readonly AccountFieldsFragment[] | null | undefined,
  today: Date
): Account[] =>
  (accounts ?? []).map(account => ({
    id: account.id,
    name: account.name,
    kind: account.kind,
    balance: account.balance,
    counts: account.counts,
    paidInto: account.paidInto,
    interest: account.interest
      ? {
          rate: account.interest.rate,
          frequency: account.interest.frequency ?? null,
          day: account.interest.day ?? null,
          nextDate: fromApiDate(account.interest.nextDate),
          accrued: account.interest.accrued,
          accruedTo: fromApiDate(account.interest.accruedTo),
          added: account.interest.added.map(added => ({
            date: fromApiDate(added.date) ?? today,
            amount: added.amount,
            balanceAfter: added.balanceAfter
          }))
        }
      : null,
    purpose: account.purpose ?? null,
    balanceUpdatedAt: fromApiDate(account.balanceUpdatedAt) ?? today
  }));

export const isSpending = (account: Pick<Account, 'kind'>) => account.kind === 'SPENDING';

export const spendingOf = (accounts: readonly Account[]) => accounts.filter(isSpending);

export const savingsOf = (accounts: readonly Account[]) =>
  accounts.filter(account => !isSpending(account));

export const paidIntoAccountOf = (accounts: readonly Account[]) =>
  accounts.find(account => account.paidInto) ?? null;

// With one account to spend from, everything goes out of it: choosing accounts only appears once
// there's another
export const hasSeveralSpending = (accounts: readonly Account[]) => spendingOf(accounts).length > 1;

/*
 * The account a payment goes out of, or an income lands in: the one it names while that's still
 * there, else where pay lands
 */
export const accountOf = (
  payment: { account: string | null },
  accounts: readonly Account[]
): Account | null =>
  accounts.find(account => account.id === payment.account) ?? paidIntoAccountOf(accounts);

const total = (accounts: readonly Account[]) =>
  roundPence(accounts.reduce((sum, account) => sum + account.balance, 0));

/*
 * The Accounts page's figures. Everything you have is every account less what's owed on debts:
 * net worth, as far as the app knows it.
 */
export const accountTotals = (accounts: readonly Account[], { owed }: { owed: number }) => {
  const spending = total(spendingOf(accounts));
  const savings = total(savingsOf(accounts));
  const counted = accounts.filter(account => account.counts);
  return {
    spending,
    savings,
    owed: roundPence(owed),
    netWorth: roundPence(spending + savings - owed),
    counted: total(counted),
    countedCount: counted.length
  };
};

/* How long ago the balance was typed in, in days */
export const balanceAge = (account: Pick<Account, 'balanceUpdatedAt'>, today: Date) =>
  Math.max(0, daysBetween(account.balanceUpdatedAt, today));

export const isStale = (account: Pick<Account, 'balanceUpdatedAt'>, today: Date) =>
  balanceAge(account, today) >= STALE_DAYS;

/* "Updated today", "Updated yesterday", "Updated 9 days ago", "Updated 5 weeks ago" */
export const updatedText = (account: Pick<Account, 'balanceUpdatedAt'>, today: Date) => {
  const days = balanceAge(account, today);
  if (days === 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  if (days < 14) return `Updated ${days} days ago`;
  if (days < 60) return `Updated ${Math.round(days / 7)} weeks ago`;
  return `Updated ${Math.round(days / 30.44)} months ago`;
};

/* "Cash ISA hasn't been updated in 5 weeks" */
export const staleText = (account: Pick<Account, 'name' | 'balanceUpdatedAt'>, today: Date) => {
  const weeks = Math.max(1, Math.round(balanceAge(account, today) / 7));
  return `${account.name} hasn’t been updated in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
};

/*
 * The line under an account's name. With one account to spend from it's "Where you get paid";
 * with several, "Spending · Shared household bills" (a tag says which one pay lands in). Savings
 * have their rate and what they're for: "Savings · 4.5% · Holiday fund".
 */
export const accountMeta = (account: Account, { several }: { several: boolean }) => {
  if (isSpending(account)) {
    if (account.paidInto && !several) return 'Where you get paid';
    return ['Spending', account.purpose].filter(Boolean).join(' · ');
  }
  return ['Savings', account.interest ? `${account.interest.rate}%` : null, account.purpose]
    .filter(Boolean)
    .join(' · ');
};

/*
 * A phone's subtitle: savings drop "Savings", as their heading says it, and the rate once interest
 * is paid on a schedule, as the strip under the row has it. "Rainy day fund", "4.1%".
 */
export const mobileAccountMeta = (account: Account, { several }: { several: boolean }) => {
  if (isSpending(account)) return accountMeta(account, { several });
  return (
    [
      account.interest && !account.interest.frequency ? `${account.interest.rate}%` : null,
      account.purpose
    ]
      .filter(Boolean)
      .join(' · ') || 'Savings'
  );
};

/* The first letter, for an account's badge */
export const accountLetter = (account: Pick<Account, 'name'>) =>
  account.name.trim().charAt(0).toUpperCase() || '·';

/*
 * The payments that come off free to spend: a payment into an account that counts only moves money
 * between the accounts making up the bank balance, so it's left out
 */
export const forFreeToSpend = <T extends { kind: string; into?: { counts: boolean } | null }>(
  payments: readonly T[]
) => payments.filter(payment => !(payment.kind === 'recurring' && payment.into?.counts));

/* Names in a sentence: "Netflix", "Netflix and Gym", "Netflix, Gym and Phone" */
export const joinNames = (names: readonly string[]) =>
  names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
