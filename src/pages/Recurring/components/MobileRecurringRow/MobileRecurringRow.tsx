import { Repeat } from 'lucide-react';
import { DebtLeft } from '~/components/debts';
import { MobilePaymentRow, NextChangeTag } from '~/components/payments';
import { isDebt } from '~/lib/debts';
import { PayCycle } from '~/lib/payday';
import {
  categoryLabel,
  cycleStatus,
  FREQUENCY_LABELS,
  intoText,
  movesTo,
  RecurringPayment,
  nextChangeOf,
  nextChangeText
} from '~/lib/payments';
import { Recurring } from '../../hooks';
import { RecurringTab } from '../../recurringModel';

/*
 * The line under the name, as the dashboard's mobile rows have it: how often, then before payday
 * where it stands this cycle ("Weekly · 1 of 4 paid"), otherwise what happens next ("Monthly · Renews
 * 2 Feb 2027"), otherwise the account it pays into ("Monthly · Into Cash ISA"), or its category.
 * Money moving between two accounts that count ends "· Not in totals", with no hover card to say so.
 */
const subtitle = (
  payment: RecurringPayment,
  { tab, cycle, today }: { tab: RecurringTab; cycle: PayCycle; today: Date }
) => {
  const frequency = FREQUENCY_LABELS[payment.frequency];
  const next = tab === 'cycle' ? null : nextChangeOf(payment, today);
  const detail =
    tab === 'cycle'
      ? cycleStatus(payment, cycle).label
      : next
        ? nextChangeText(next, { today, form: 'long' })
        : (intoText(payment) ?? categoryLabel(payment.category));
  return `${frequency} · ${detail}${movesTo(payment) ? ' · Not in totals' : ''}`;
};

/* One recurring payment on a phone, with how often it goes out under its name */
export const MobileRecurringRow = ({
  payment,
  recurring
}: {
  payment: RecurringPayment;
  recurring: Recurring;
}) => {
  const { tab, today, cycle, selection } = recurring;
  // A debt's line is what's left to pay, so a rate ending is its tag
  const next = nextChangeOf(payment, today);

  return (
    <MobilePaymentRow
      payment={payment}
      checkboxId={`recurring-mobile-${payment.id}`}
      selection={selection}
      notes={recurring.notesFor(payment.id)}
      cycle={cycle}
      today={today}
      timesDue={tab === 'cycle'}>
      {isDebt(payment) && tab !== 'cycle' ? (
        <>
          <DebtLeft debt={payment} className="mt-[5px] text-xs font-medium text-muted" />
          {next ? <NextChangeTag next={next} today={today} className="mt-1.5 h-[22px]" /> : null}
        </>
      ) : (
        <span className="mt-[3px] flex min-w-0 items-center gap-[5px] text-xs font-medium text-muted">
          <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
          <span>{subtitle(payment, { tab, cycle, today })}</span>
        </span>
      )}
    </MobilePaymentRow>
  );
};
