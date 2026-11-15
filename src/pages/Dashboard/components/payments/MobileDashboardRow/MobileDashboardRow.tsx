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
  Payment,
  renewalNote
} from '~/lib/payments';
import { PaymentTab } from '../../../dashboardModel';
import { Dashboard } from '../../../hooks';

interface MetaOptions {
  tab: PaymentTab;
  cycle: PayCycle;
  today: Date;
}

/*
 * The line under the name. "Into Joint bills" takes the category's place, and money moving between
 * two accounts that count ends "· Not in totals", with no hover card on a phone to say so.
 */
const metaFor = (payment: Payment, { tab, cycle, today }: MetaOptions) => {
  const into = intoText(payment);
  const renewal = renewalNote(payment, today);
  const category = (into ?? categoryLabel(payment.category)) + (renewal ? ` · ${renewal}` : '');
  const meta =
    tab === 'recurring' && payment.kind === 'recurring'
      ? `${FREQUENCY_LABELS[payment.frequency]} · ${cycleStatus(payment, cycle).label}`
      : tab === 'oneOff'
        ? `${payment.type === 'INCOME' ? 'Income' : 'Expense'} · ${category}`
        : `${payment.kind === 'recurring' ? 'Recurring' : 'One-off'} · ${category}`;
  return movesTo(payment) ? `${meta} · Not in totals` : meta;
};

export const MobileDashboardRow = ({
  payment,
  dashboard
}: {
  payment: Payment;
  dashboard: Dashboard;
}) => {
  const { tab, today, cycle, selection } = dashboard;

  return (
    <MobilePaymentRow
      payment={payment}
      checkboxId={`mobile-${payment.id}`}
      selection={selection}
      notes={dashboard.notesFor(payment.id)}
      cycle={cycle}
      today={today}
      timesDue={tab === 'upcoming'}>
      {/* A debt says what's left, as on Recurring; its status still shows on the recurring tab */}
      {isDebt(payment) && tab !== 'recurring' ? (
        <DebtLeft debt={payment} className="mt-[5px] text-xs font-medium text-muted" />
      ) : (
        <span className="mt-[3px] flex items-center gap-[5px] text-xs font-medium text-muted">
          {payment.kind === 'recurring' ? (
            <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
          ) : null}
          {metaFor(payment, { tab, cycle, today })}
        </span>
      )}
    </MobilePaymentRow>
  );
};
