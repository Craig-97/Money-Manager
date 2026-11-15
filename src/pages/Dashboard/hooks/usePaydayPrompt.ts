import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LeftOverOutcome, StartPaydayCycleDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import {
  accountOf,
  hasSeveralSpending,
  isSpending,
  isStale,
  paidIntoAccountOf,
  toAccounts,
  updatedText
} from '~/lib/accounts';
import { daysBetween, toIsoDate } from '~/lib/dates';
import { formatMoneyInput, parseMoney, plural, roundPence } from '~/lib/format';
import { BankHolidays, PayCycle } from '~/lib/payday';
import { Payment } from '~/lib/payments';
import { showErrorToast, showToast } from '~/state/toast';
import {
  accountMoves,
  balanceParts,
  dueSinceDetail,
  dueSinceOf,
  leftOverDetail,
  leftOverNote,
  leftOverOf,
  movedInto,
  needsNewCycle,
  otherAccountLine,
  overdueOneOffs,
  paydaysSince,
  startedText,
  suggestedBalance
} from '../paydayCheck';

interface Options {
  budget: Budget;
  cycle: PayCycle;
  holidays: BankHolidays;
  today: Date;
  payments: Payment[];
  markPaid: (payments: Payment[]) => Promise<void>;
}

// What a left-over payment starts as: most are direct debits that went out on their own
const DEFAULT_OUTCOME: LeftOverOutcome = 'PAID';

/*
 * The payday prompt: check what's gone out, confirm the account pay lands in, update the other
 * accounts if wanted, and start the next cycle, catching up on overdue one-offs
 */
export const usePaydayPrompt = ({
  budget,
  cycle,
  holidays,
  today,
  payments,
  markPaid
}: Options) => {
  const [startCycle, { loading: starting }] = useMutation(StartPaydayCycleDocument);
  const due = needsNewCycle(cycle, budget.cycleStartedOn);
  // The pay from each payday missed is in the bank
  const paydays = paydaysSince(budget, { cycle, holidays });
  const income = roundPence(budget.monthlyIncome * paydays);
  const [open, setOpen] = useState(due);
  // The steps, or the summary once the cycle has started. Kept as it is while the dialog closes, so
  // it slides away showing what it showed, not the steps again.
  const [stage, setStage] = useState<'steps' | 'done'>('steps');
  const [outcomes, setOutcomes] = useState<Record<string, LeftOverOutcome>>({});
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set());
  // What the user typed over the suggestion, if anything
  const [typed, setTyped] = useState<string | null>(null);
  // The optional last step starts folded away
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
  // With more than one account to spend from, step 1 says which each payment goes out of
  const several = hasSeveralSpending(accounts);
  const fromNameOf = (payment: Payment) =>
    several ? (accountOf(payment, accounts)?.name ?? null) : null;
  const otherSpending = others.some(isSpending);

  const outcomeOf = (id: string) => outcomes[id] ?? DEFAULT_OUTCOME;
  const leftOver = leftOverOf(payments, cycle);
  const stillDue = new Set(
    leftOver.filter(item => outcomeOf(item.payment.id) === 'DUE').map(item => item.payment.id)
  );
  const dueSince = dueSinceOf(payments, { cycle, today, stillDue });
  const goneOut = dueSince.filter(item => ticked.has(item.key));
  const paidLeftOver = leftOver.filter(item => outcomeOf(item.payment.id) === 'PAID');
  const overdue = overdueOneOffs(payments, cycle);

  // Pay lands in this account, so that's what's confirmed. Only what goes out of it comes off.
  const lastBalance = current?.balance ?? budget.bankBalance;
  const fromCurrent = {
    leftOver: leftOver.filter(item => isFrom(item.payment, current?.id)),
    goneOut: goneOut.filter(item => isFrom(item.payment, current?.id))
  };
  const projected = suggestedBalance({
    bankBalance: lastBalance,
    income,
    outcomes,
    ...fromCurrent
  });
  // The same figures, as the line under the balance shows them
  const parts = balanceParts({ bankBalance: lastBalance, outcomes, intoNameOf, ...fromCurrent });
  // Changes with the choices above until it's typed over
  const balance = typed ?? formatMoneyInput(projected);
  const parsed = parseMoney(balance);
  const edited = typed !== null && (parsed === null || Math.abs(parsed - projected) > 0.004);

  const { paidIn, paidOut } = accountMoves([...paidLeftOver, ...goneOut], {
    accounts,
    paidIntoId: current?.id
  });
  const savingsRows = others.map(account => {
    const added = paidIn.get(account.id) ?? 0;
    const out = paidOut.get(account.id) ?? 0;
    // The API adds money moved in itself, but leaves what's gone out to the balance confirmed here
    const afterApi = roundPence(account.balance + added);
    const expected = roundPence(afterApi - out);
    const value = savingsTyped[account.id] ?? formatMoneyInput(expected);
    const amount = parseMoney(value);
    const line = otherAccountLine(account, { added, out, today });
    // Interest the app added since the balance was typed in is checked here
    const interestAdded = (account.interest?.added.length ?? 0) > 0;
    return {
      account,
      value,
      expected,
      // Sent only when it isn't what the API would leave it at, or interest was added: then it's
      // been checked, which clears the alert asking to
      changed:
        amount !== null && (Math.abs(amount - afterApi) > 0.004 || interestAdded) ? amount : null,
      sub: line.text,
      stale: line.stale,
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
            payday: toIsoDate(cycle.start),
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
      const moved = savingsRows
        .filter(row => row.changed === null && paidIn.has(row.account.id))
        .map(row => ({
          amount: paidIn.get(row.account.id) ?? 0,
          name: row.account.name,
          spending: isSpending(row.account)
        }));
      const text = startedText({
        paid,
        skipped,
        moved,
        updated: updated.map(row => row.account.name)
      });
      setResult({ balance: paidIntoBalance, text });
      setStage('done');
    } catch (error) {
      showErrorToast(error, { fallback: "Couldn't start the new cycle. Try again." });
    }
  };

  const skip = () => {
    setOpen(false);
    showToast({
      message: 'Payday prompt skipped',
      action: {
        label: 'Show again',
        onClick: () => {
          setStage('steps');
          setOpen(true);
        }
      }
    });
  };

  return {
    open,
    done: stage === 'done',
    close: () => setOpen(false),
    skip,
    payday: cycle.start,
    // Days since payday, when the prompt is catching up on one that's been and gone
    daysLate: Math.max(0, daysBetween(cycle.start, today)),
    income,
    // How many paydays that pay is from: more than one when paydays were missed
    paydays,
    lastBalance,
    // The account pay lands in, which step 2 confirms
    paidIntoName: current?.name ?? 'Current account',
    // More than one account to spend from: step 3 is the others, not just savings
    otherSpending,
    leftOver: leftOver.map(item => ({
      ...item,
      outcome: outcomeOf(item.payment.id),
      detail: leftOverDetail(item, { today, fromName: fromNameOf(item.payment) }),
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
      detail: dueSinceDetail(item, {
        today,
        intoName: intoNameOf(item.payment),
        fromName: fromNameOf(item.payment)
      }),
      toggle: () =>
        setTicked(currentTicked => {
          const next = new Set(currentTicked);
          if (!next.delete(item.key)) next.add(item.key);
          return next;
        })
    })),
    // The suggestion's parts: where it starts, then each change after the pay
    parts,
    // What the ticked payments add to other accounts: "The £600.00 is added to Joint bills."
    movedIn: movedInto(goneOut, intoNameOf),
    balance,
    setBalance: setTyped,
    edited,
    savings: {
      rows: savingsRows,
      open: savingsOpen,
      toggle: () => setSavingsOpen(open => !open),
      // "3 accounts", then "Cash ISA updated 5 weeks ago" in amber when one is old
      count: plural(others.length, 'account'),
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
