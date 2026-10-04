import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { StartPaydayCycleDocument } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { addDays, daysBetween, fromApiDate, toApiDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import { nextOccurrence, Payment, RecurringPayment, Summary } from '~/lib/payments';
import { showToast } from '~/state/toast';

interface Options {
  account: Account;
  cycle: PayCycle;
  today: Date;
  payments: Payment[];
  summary: Summary;
  markPaid: (payments: Payment[]) => Promise<void>;
}

/*
 * Whether the latest payday's cycle still needs starting: it's after the last cycle was started.
 * Setup counts as a start, so a new account waits for its first payday. That also catches a
 * payday missed over a weekend.
 */
export const needsNewCycle = (cycle: PayCycle, cycleStartedOn: string | null | undefined) => {
  const started = fromApiDate(cycleStartedOn);
  return !started || started < cycle.start;
};

/* The date a recurring payment moves on to when the cycle restarts */
const movesTo = (payment: RecurringPayment, today: Date) => {
  const after = payment.dueDate ? addDays(payment.dueDate, 1) : today;
  return nextOccurrence(payment, after > today ? after : today);
};

/* The payday prompt: confirm the balance, start the next cycle, and catch up on anything overdue */
export const usePaydayPrompt = ({
  account,
  cycle,
  today,
  payments,
  summary,
  markPaid
}: Options) => {
  const [startCycle, { loading: starting }] = useMutation(StartPaydayCycleDocument);
  const due = needsNewCycle(cycle, account.cycleStartedOn);
  const [view, setView] = useState<'open' | 'closed' | 'done'>(due ? 'open' : 'closed');

  // Recurring payments dated before payday belong to the cycle that just ended. Anything due
  // from payday on is already in the new cycle, paid or not, so it stays where it is.
  const toReset = payments.filter(
    (payment): payment is RecurringPayment =>
      payment.kind === 'recurring' && payment.dueDate !== null && payment.dueDate < cycle.start
  );
  const overdue = payments.filter(
    payment =>
      payment.kind === 'oneOff' &&
      payment.state === 'unpaid' &&
      payment.dueDate &&
      payment.dueDate < today
  );

  const projected = summary.freeToSpend + account.monthlyIncome;
  const [balance, setBalance] = useState(() => formatMoneyInput(projected));
  const [chosen, setChosen] = useState<ReadonlySet<string>>(() => new Set(toReset.map(p => p.id)));
  const [overduePaid, setOverduePaid] = useState(false);
  const [result, setResult] = useState({ balance: 0, reset: 0 });

  const typed = parseMoney(balance);
  const edited = typed === null || Math.abs(typed - projected) > 0.004;

  const start = async () => {
    const bankBalance = typed ?? projected;
    const ids = toReset.filter(p => chosen.has(p.id)).map(p => p.id);
    try {
      await startCycle({
        variables: {
          input: {
            accountId: account.id,
            payday: toApiDate(cycle.start),
            bankBalance,
            recurringPaymentIds: ids
          }
        }
      });
      setResult({ balance: bankBalance, reset: ids.length });
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
    income: account.monthlyIncome,
    projectedBase: summary.freeToSpend,
    balance,
    setBalance,
    edited,
    toReset: toReset.map(payment => ({ payment, next: movesTo(payment, today) })),
    chosen,
    toggle: (id: string) =>
      setChosen(current => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
      }),
    setAll: (all: boolean) => setChosen(all ? new Set(toReset.map(p => p.id)) : new Set()),
    overdue,
    overduePaid,
    payOverdue: async () => {
      await markPaid(overdue);
      setOverduePaid(true);
    },
    starting,
    start: () => void start(),
    resultBalance: result.balance,
    resetText:
      result.reset === 0
        ? 'No recurring payments were reset.'
        : `${result.reset} recurring ${result.reset === 1 ? 'payment was' : 'payments were'} reset to unpaid and moved to the next date.`
  };
};

export type PaydayPrompt = ReturnType<typeof usePaydayPrompt>;
