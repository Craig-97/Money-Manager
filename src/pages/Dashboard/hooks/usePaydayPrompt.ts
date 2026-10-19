import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LeftOverOutcome, StartPaydayCycleDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { daysBetween, fromApiDate, toApiDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
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

/*
 * The payday prompt: check what's gone out, confirm the balance, and start the next cycle, catching
 * up on overdue one-offs
 */
export const usePaydayPrompt = ({ budget, cycle, today, payments, markPaid }: Options) => {
  const [startCycle, { loading: starting }] = useMutation(StartPaydayCycleDocument);
  const due = needsNewCycle(cycle, budget.cycleStartedOn);
  const [view, setView] = useState<'open' | 'closed' | 'done'>(due ? 'open' : 'closed');
  const [outcomes, setOutcomes] = useState<Record<string, LeftOverOutcome>>({});
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set());
  // What the user typed over the suggestion, if anything
  const [typed, setTyped] = useState<string | null>(null);
  const [overduePaid, setOverduePaid] = useState(false);
  const [result, setResult] = useState({ balance: 0, text: '' });

  const outcomeOf = (id: string) => outcomes[id] ?? DEFAULT_OUTCOME;
  const leftOver = leftOverOf(payments, cycle);
  const stillDue = new Set(
    leftOver.filter(item => outcomeOf(item.payment.id) === 'DUE').map(item => item.payment.id)
  );
  const dueSince = dueSinceOf(payments, { cycle, today, stillDue });
  const goneOut = dueSince.filter(item => ticked.has(item.key));
  // One-offs from last cycle never paid; ones due since payday are in "Check what's gone out"
  const overdue = payments.filter(
    payment =>
      payment.kind === 'oneOff' &&
      !payment.paidAt &&
      payment.dueDate &&
      payment.dueDate < cycle.start
  );

  const projected = suggestedBalance({
    bankBalance: budget.bankBalance,
    income: budget.monthlyIncome,
    leftOver,
    outcomes,
    goneOut
  });
  // Changes with the choices above until it's typed over
  const balance = typed ?? formatMoneyInput(projected);
  const parsed = parseMoney(balance);
  const edited = typed !== null && (parsed === null || Math.abs(parsed - projected) > 0.004);

  const start = async () => {
    const bankBalance = parsed ?? projected;
    try {
      await startCycle({
        variables: {
          input: {
            budgetId: budget.id,
            payday: toApiDate(cycle.start),
            bankBalance,
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
      const paid = [
        ...new Set(
          [...leftOver.filter(item => outcomeOf(item.payment.id) === 'PAID'), ...goneOut].map(
            item => item.payment.name
          )
        )
      ];
      const skipped = leftOver
        .filter(item => outcomeOf(item.payment.id) === 'SKIPPED')
        .map(item => item.payment.name);
      const text = [
        paid.length
          ? `${listNames(paid)} ${paid.length === 1 ? 'was' : 'were'} recorded as paid.`
          : '',
        skipped.length
          ? `${listNames(skipped)} ${skipped.length === 1 ? 'was' : 'were'} recorded as skipped.`
          : ''
      ]
        .filter(Boolean)
        .join(' ');
      setResult({ balance: bankBalance, text });
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
    bankBalance: budget.bankBalance,
    leftOver: leftOver.map(item => ({
      ...item,
      outcome: outcomeOf(item.payment.id),
      detail: leftOverDetail(item, today),
      note: leftOverNote(item, { outcome: outcomeOf(item.payment.id), cycle, today }),
      setOutcome: (outcome: LeftOverOutcome) =>
        setOutcomes(current => ({ ...current, [item.payment.id]: outcome }))
    })),
    dueSince: dueSince.map(item => ({
      ...item,
      ticked: ticked.has(item.key),
      detail: dueSinceDetail(item, today),
      toggle: () =>
        setTicked(current => {
          const next = new Set(current);
          if (!next.delete(item.key)) next.add(item.key);
          return next;
        })
    })),
    // What's taken off for payments gone out: last cycle's paid ones and today's ticked ones
    goneOutTotal: Math.max(0, budget.bankBalance + budget.monthlyIncome - projected),
    balance,
    setBalance: setTyped,
    edited,
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
