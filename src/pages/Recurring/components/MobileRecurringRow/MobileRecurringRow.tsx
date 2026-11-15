import { Repeat } from 'lucide-react';
import { DebtLeft } from '~/components/debts';
import { MobilePaymentRow } from '~/components/payments';
import { isDebt } from '~/lib/debts';
import { PayCycle } from '~/lib/payday';
import {
  categoryLabel,
  cycleStatus,
  FREQUENCY_LABELS,
  intoText,
  movesTo,
  RecurringPayment,
  renewalOf,
  renewalTag
} from '~/lib/payments';
import { Recurring } from '../../hooks';
import { RecurringTab } from '../../recurringModel';

/*
 * The line under the name, as the dashboard's mobile rows have it: how often, then before payday
 * where it stands this cycle ("Weekly · 1 of 4 paid"), otherwise its renewal ("Monthly · Renews
 * 2 Feb 2027"), otherwise the account it pays into ("Monthly · Into Cash ISA"), or its category.
 * Money moving between two accounts that count ends "· Not in totals", with no hover card to say so.
 */
const subtitle = (
  payment: RecurringPayment,
  { tab, cycle, today }: { tab: RecurringTab; cycle: PayCycle; today: Date }
) => {
  const frequency = FREQUENCY_LABELS[payment.frequency];
  const renewal = tab === 'cycle' ? null : renewalOf(payment, today);
  const detail =
    tab === 'cycle'
      ? cycleStatus(payment, cycle).label
      : renewal
        ? renewalTag(renewal, today)
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
        <DebtLeft debt={payment} className="mt-[5px] text-xs font-medium text-muted" />
      ) : (
        <span className="mt-[3px] flex min-w-0 items-center gap-[5px] text-xs font-medium text-muted">
          <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
          <span>{subtitle(payment, { tab, cycle, today })}</span>
        </span>
      )}
    </MobilePaymentRow>
  );
};
