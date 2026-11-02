import { cn } from '~/lib/cn';
import { daysBetween } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { cycleStatus, formatShortDate, Payment } from '~/lib/payments';

interface StatusLineProps {
  payment: Payment;
  today: Date;
  cycle: PayCycle;
}

/*
 * Where an existing payment stands, under the edit form's title: "Unpaid · due Sat 24 Oct". Paying,
 * skipping or undoing is in its quick view.
 */
export const StatusLine = ({ payment, today, cycle }: StatusLineProps) => {
  const status =
    payment.kind === 'recurring'
      ? cycleStatus(payment, cycle)
      : payment.paidAt
        ? { tone: 'paid' as const, label: 'Paid' }
        : { tone: 'unpaid' as const, label: 'Unpaid' };
  const days = payment.dueDate ? daysBetween(today, payment.dueDate) : null;
  const dueText =
    days === null
      ? 'no upcoming date'
      : days === 0
        ? 'due today'
        : // "next" only once this cycle's date is dealt with, so the date isn't read as the one paid
          `${days < 0 ? 'overdue since' : status.tone === 'paid' || status.tone === 'skipped' ? 'next due' : 'due'} ${formatShortDate(payment.dueDate!, today)}`;

  return (
    <span className="mt-1 flex items-center gap-2 text-[13px] font-bold text-muted">
      <span
        aria-hidden="true"
        className={cn(
          'size-2 shrink-0 rounded-full',
          status.tone === 'skipped'
            ? 'bg-accent'
            : status.tone === 'paid'
              ? 'bg-income'
              : status.tone === 'ended'
                ? 'bg-faint'
                : 'bg-expense'
        )}
      />
      {status.tone === 'ended' ? 'Ended · no upcoming date' : `${status.label} · ${dueText}`}
    </span>
  );
};
