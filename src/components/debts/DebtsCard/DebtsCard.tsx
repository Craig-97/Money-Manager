import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '~/constants';
import { clearedText, debtTotals, DebtPayment, simulatePayoff } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { ProgressRing } from '../ProgressRing';

/* Mobile Recurring: the debts at a glance, opening the Debts page */
export const DebtsCard = ({ debts, today }: { debts: readonly DebtPayment[]; today: Date }) => {
  const totals = debtTotals(debts);
  const { months } = simulatePayoff(debts);

  return (
    <Link
      to={ROUTES.debts}
      className="flex items-center gap-3.5 rounded-3xl border border-border bg-surface p-3.5 text-text no-underline transition-colors hover:bg-hover">
      <ProgressRing share={totals.paidOffShare} size={52} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-extrabold">Debts</span>
        <span className="truncate text-[13px] font-medium text-muted">
          {formatMoney(totals.left, { whole: true })} left
          {months === null ? '' : ` · debt-free ${clearedText(months, today)}`}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
    </Link>
  );
};
