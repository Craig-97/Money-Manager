import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LeftOverOutcome, StartPaydayCycleDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { accountOf, isStale, paidIntoAccountOf, toAccounts, updatedText } from '~/lib/accounts';
import { daysBetween, fromApiDate, toApiDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoney, formatMoneyInput, parseMoney } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import { Payment } from '~/lib/payments';
import { showToast } from '~/state/toast';
import {
  dueSinceDetail,
  dueSinceOf,
  leftOverDetail,
  leftOverNote,
  leftOverOf,
  listNames,
  suggestedBalance
} from '../paydayCheck';

interface Options {
  budget: Budget;
  cycle: PayCycle;
  today: Date;
  payments: Payment[];
  markPaid: (payments: Payment[]) => Promise<void>;
}

/*
 * Whether the latest payday's cycle still needs starting: it's after the last cycle was started.
 * Setup counts as a start, so a new budget waits for its first payday. That also catches a payday
 * missed over a weekend.
 */
const needsNewCycle = (cycle: PayCycle, cycleStartedOn: string | null | undefined) => {
  const started = fromApiDate(cycleStartedOn);
  return !started || started < cycle.start;
};

// What a left-over payment starts as: most are direct debits that went out on their own
const DEFAULT_OUTCOME: LeftOverOutcome = 'PAID';

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

/*
 * The payday prompt: check what's gone out, confirm the account pay lands in, update the other
 * accounts if wanted, and start the next cycle, catching up on overdue one-offs
 */
export const usePaydayPrompt = ({ budget, cycle, today, payments, markPaid }: Options) => {
  const [startCycle, { loading: starting }] = useMutation(StartPaydayCycleDocument);
  const due = needsNewCycle(cycle, budget.cycleStartedOn);
  const [view, setView] = useState<'open' | 'closed' | 'done'>(due ? 'open' : 'closed');
  const [outcomes, setOutcomes] = useState<Record<string, LeftOverOutcome>>({});
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set());
  // What the user typed over the suggestion, if anything
  const [typed, setTyped] = useState<string | null>(null);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [savingsTyped, setSavingsTyped] = useState<Record<string, string>>({});
  const [overduePaid, setOverduePaid] = useState(false);
  const [result, setResult] = useState({ balance: 0, text: '' });

  const accounts = toAccounts(budget.accounts, today);
  const current = paidIntoAccountOf(accounts);
  // Spending accounts first, then savings, as the API lists them
  const others = accounts.filter(account => account.id !== current?.id);
  const isFrom = (payment: Payment, id: string | undefined) =>
    accountOf(payment, accounts)?.id === id;
  const nameOf = (id: string | null) => accounts.find(account => account.id === id)?.name ?? null;
  const intoNameOf = (payment: Payment) =>
    payment.kind === 'recurring' ? nameOf(payment.paysInto) : null;

  const outcomeOf = (id: string) => outcomes[id] ?? DEFAULT_OUTCOME;
  const leftOver = leftOverOf(payments, cycle);
  const stillDue = new Set(
    leftOver.filter(item => outcomeOf(item.payment.id) === 'DUE').map(item => item.payment.id)
  );
  const dueSince = dueSinceOf(payments, { cycle, today, stillDue });
  const goneOut = dueSince.filter(item => ticked.has(item.key));
  const paidLeftOver = leftOver.filter(item => outcomeOf(item.payment.id) === 'PAID');
  // One-offs from last cycle never paid; ones due since payday are in "Check what's gone out"
  const overdue = payments.filter(
    payment =>
      payment.kind === 'oneOff' &&
      !payment.paidAt &&
      payment.dueDate &&
      payment.dueDate < cycle.start
  );

  // Pay lands in this account, so that's what's confirmed. Only what goes out of it comes off.
  const lastBalance = current?.balance ?? budget.bankBalance;
  const projected = suggestedBalance({
    bankBalance: lastBalance,
    income: budget.monthlyIncome,
    leftOver: leftOver.filter(item => isFrom(item.payment, current?.id)),
    outcomes,
    goneOut: goneOut.filter(item => isFrom(item.payment, current?.id))
  });
  // Changes with the choices above until it's typed over
  const balance = typed ?? formatMoneyInput(projected);
  const parsed = parseMoney(balance);
  const edited = typed !== null && (parsed === null || Math.abs(parsed - projected) > 0.004);

  // What payments moving money into other accounts add, and what's gone out of each, from the
  // ones recorded as paid here
  const paidIn = new Map<string, number>();
  const paidOut = new Map<string, number>();
  const add = (map: Map<string, number>, { id, amount }: { id: string; amount: number }) =>
    map.set(id, roundPence((map.get(id) ?? 0) + amount));
  for (const item of [...paidLeftOver, ...goneOut]) {
    const times = item.dates.length;
    const from = accountOf(item.payment, accounts);
    if (from && from.id !== current?.id)
      add(paidOut, { id: from.id, amount: -item.payment.signedAmount * times });
    if (item.payment.kind === 'recurring' && item.payment.paysInto) {
      add(paidIn, { id: item.payment.paysInto, amount: item.payment.amount * times });
    }
  }
  const savingsRows = others.map(account => {
    const added = paidIn.get(account.id) ?? 0;
    const out = paidOut.get(account.id) ?? 0;
    // The API adds money moved in itself, but leaves what's gone out to the balance confirmed here
    const afterApi = roundPence(account.balance + added);
    const expected = roundPence(afterApi - out);
    const value = savingsTyped[account.id] ?? formatMoneyInput(expected);
    const amount = parseMoney(value);
    const sub = [
      added ? `Includes ${formatMoney(added)} paid in` : null,
      out ? `${formatMoney(out)} gone out` : null
    ]
      .filter(Boolean)
      .join(' · ');
    return {
      account,
      value,
      expected,
      // Sent only when it isn't what the API would leave it at
      changed: amount !== null && Math.abs(amount - afterApi) > 0.004 ? amount : null,
      sub: sub || updatedText(account, today),
      stale: !sub && isStale(account, today),
      setValue: (next: string) =>
        setSavingsTyped(currentTyped => ({ ...currentTyped, [account.id]: next }))
    };
  });
  const staleSavings = others.filter(account => isStale(account, today));

  const start = async () => {
    const paidIntoBalance = parsed ?? projected;
    const updated = savingsRows.filter(row => row.changed !== null);
    try {
      await startCycle({
        variables: {
          input: {
            budgetId: budget.id,
            payday: toApiDate(cycle.start),
            paidIntoBalance,
            accountBalances: updated.map(row => ({
              accountId: row.account.id,
              balance: row.changed as number
            })),
            leftOver: leftOver.map(({ payment }) => ({
              recurringPaymentId: payment.id,
              outcome: outcomeOf(payment.id)
            })),
            alreadyPaid: {
              recurringPaymentIds: goneOut
                .filter(item => item.payment.kind === 'recurring')
                .map(item => item.payment.id),
              oneOffPaymentIds: goneOut
                .filter(item => item.payment.kind === 'oneOff')
                .map(item => item.payment.id)
            }
          }
        }
      });
      // Each payment named once, though its left-over and today's dates may both be paid
      const paid = [...new Set([...paidLeftOver, ...goneOut].map(item => item.payment.name))];
      const skipped = leftOver
        .filter(item => outcomeOf(item.payment.id) === 'SKIPPED')
        .map(item => item.payment.name);
      const added = savingsRows
        .filter(row => row.changed === null && paidIn.has(row.account.id))
        .map(
          row => `${formatMoney(paidIn.get(row.account.id) ?? 0)} added to ${row.account.name}.`
        );
      const text = [
        paid.length
          ? `${listNames(paid)} ${paid.length === 1 ? 'was' : 'were'} recorded as paid.`
          : '',
        skipped.length
          ? `${listNames(skipped)} ${skipped.length === 1 ? 'was' : 'were'} recorded as skipped.`
          : '',
        ...added,
        updated.length
          ? `${listNames(updated.map(row => row.account.name))} ${updated.length === 1 ? 'was' : 'were'} updated.`
          : ''
      ]
        .filter(Boolean)
        .join(' ');
      setResult({ balance: paidIntoBalance, text });
      setView('done');
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't start the new cycle. Try again.") });
    }
  };

  const skip = () => {
    setView('closed');
    showToast({
      message: 'Payday prompt skipped',
      action: { label: 'Show again', onClick: () => setView('open') }
    });
  };

  return {
    open: view !== 'closed',
    done: view === 'done',
    close: () => setView('closed'),
    skip,
    payday: cycle.start,
    // Days since payday, when the prompt is catching up on one that's been and gone
    daysLate: Math.max(0, daysBetween(cycle.start, today)),
    income: budget.monthlyIncome,
    lastBalance,
    // The account pay lands in, which step 2 confirms
    paidIntoName: current?.name ?? 'Current account',
    // More than one account to spend from: step 3 is the others, not just savings
    otherSpending: others.some(account => account.kind === 'SPENDING'),
    leftOver: leftOver.map(item => ({
      ...item,
      outcome: outcomeOf(item.payment.id),
      detail: leftOverDetail(item, today),
      note: leftOverNote(item, {
        outcome: outcomeOf(item.payment.id),
        cycle,
        today,
        intoName: intoNameOf(item.payment)
      }),
      setOutcome: (outcome: LeftOverOutcome) =>
        setOutcomes(currentOutcomes => ({ ...currentOutcomes, [item.payment.id]: outcome }))
    })),
    dueSince: dueSince.map(item => ({
      ...item,
      ticked: ticked.has(item.key),
      detail: dueSinceDetail(item, { today, intoName: intoNameOf(item.payment) }),
      toggle: () =>
        setTicked(currentTicked => {
          const next = new Set(currentTicked);
          if (!next.delete(item.key)) next.add(item.key);
          return next;
        })
    })),
    // What's taken off for payments gone out: last cycle's paid ones and today's ticked ones
    goneOutTotal: Math.max(0, lastBalance + budget.monthlyIncome - projected),
    balance,
    setBalance: setTyped,
    edited,
    savings: {
      rows: savingsRows,
      open: savingsOpen,
      toggle: () => setSavingsOpen(open => !open),
      // "3 accounts", then "Cash ISA updated 5 weeks ago" in amber when one is old
      count: `${others.length} ${others.length === 1 ? 'account' : 'accounts'}`,
      staleText: staleSavings[0]
        ? `${staleSavings[0].name} ${updatedText(staleSavings[0], today).toLowerCase()}`
        : null
    },
    overdue,
    overduePaid,
    payOverdue: async () => {
      await markPaid(overdue);
      setOverduePaid(true);
    },
    starting,
    start: () => void start(),
    resultBalance: result.balance,
    resultText: result.text
  };
};

export type PaydayPrompt = ReturnType<typeof usePaydayPrompt>;
