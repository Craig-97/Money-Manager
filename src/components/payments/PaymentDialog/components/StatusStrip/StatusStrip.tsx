import { Check, SkipForward, Undo2 } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { cn } from '~/lib/cn';
import { daysBetween } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { cycleStatus, formatShortDate, Payment, paymentChoices } from '~/lib/payments';

interface StatusStripProps {
  payment: Payment;
  today: Date;
  cycle: PayCycle;
  accountId: string;
  // Paying a one-off deletes it, which ends the edit
  onDone: () => void;
}

/* Where an existing payment stands, with shortcuts to pay, skip or undo */
export const StatusStrip = ({ payment, today, cycle, accountId, onDone }: StatusStripProps) => {
  const { pay, undo, skip } = usePaymentActions(accountId);
  const recurring = payment.kind === 'recurring' ? payment : null;
  const status = recurring
    ? cycleStatus(recurring, cycle)
    : { tone: 'unpaid' as const, label: 'Unpaid' };
  const choices = paymentChoices(payment, cycle, today);
  const days = payment.dueDate ? daysBetween(today, payment.dueDate) : null;
  const dueText =
    days === null
      ? 'no upcoming date'
      : days === 0
        ? 'due today'
        : // "next" only once this cycle's date is dealt with, so the date isn't read as the one paid
          `${days < 0 ? 'overdue since' : status.tone === 'paid' || status.tone === 'skipped' ? 'next due' : 'due'} ${formatShortDate(payment.dueDate!, today)}`;
  const text =
    status.tone === 'ended' ? 'Ended · no upcoming date' : `${status.label} · ${dueText}`;

  return (
    <div className="flex flex-col gap-2.5 rounded-[22px] border border-border bg-surface-2 p-3 md:flex-row md:items-center md:gap-2 md:rounded-[28px] md:py-1.5 md:pr-1.5 md:pl-[18px]">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1 md:px-0">
        <span
          aria-hidden="true"
          className={cn(
            'size-2.5 shrink-0 rounded-full',
            status.tone === 'skipped'
              ? 'bg-accent'
              : status.tone === 'paid'
                ? 'bg-income'
                : status.tone === 'ended'
                  ? 'bg-faint'
                  : 'bg-expense'
          )}
        />
        <span className="text-sm leading-[1.3] font-bold">{text}</span>
      </div>
      <div className="flex gap-2">
        {recurring && choices.skipNext ? (
          <Button
            variant="ghost"
            onClick={() => void skip(recurring)}
            className="flex-1 bg-surface-2 text-[13px] text-text max-md:border-border md:flex-none md:bg-transparent md:px-3.5 md:text-muted">
            <SkipForward size={15} aria-hidden="true" />
            {choices.skipNext}
          </Button>
        ) : null}
        {choices.pay ? (
          <Button
            variant="solid"
            onClick={() => {
              void pay([payment]);
              if (payment.kind === 'oneOff') onDone();
            }}
            className="flex-1 text-[13px] md:flex-none md:px-3.5">
            <Check size={15} strokeWidth={2.5} aria-hidden="true" />
            {choices.pay}
          </Button>
        ) : recurring && choices.undo ? (
          <Button
            variant="solid"
            onClick={() => void undo(recurring)}
            className="flex-1 text-[13px] md:flex-none md:px-3.5">
            <Undo2 size={15} aria-hidden="true" />
            {choices.undo}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
