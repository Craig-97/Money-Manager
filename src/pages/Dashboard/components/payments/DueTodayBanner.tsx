import { Bell, Check } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { formatMoney } from '~/lib/format';
import { categoryLabel, FREQUENCY_LABELS, Payment } from '~/lib/payments';
import { Dashboard } from '../../hooks';

const subline = (payment: Payment) =>
  [
    payment.kind === 'recurring' ? 'Recurring' : 'One-off',
    payment.kind === 'recurring'
      ? FREQUENCY_LABELS[payment.frequency]
      : payment.type === 'INCOME'
        ? 'Income'
        : 'Expense',
    categoryLabel(payment.category)
  ].join(' · ');

/* A nudge for something due today, with a shortcut to mark it paid */
export const DueTodayBanner = ({ dashboard }: { dashboard: Dashboard }) => {
  const payment = dashboard.dueToday;
  if (!payment) return null;

  return (
    <section
      aria-label="Due today"
      className="flex flex-col gap-3 rounded-[22px] border border-border bg-surface p-3.5 transition-[translate,box-shadow,border-color] duration-200 md:-mb-3 md:flex-row md:flex-wrap md:items-center md:gap-4 md:rounded-3xl md:py-3 md:pr-3 md:pl-3.5 md:hover:-translate-y-0.5 md:hover:border-border-strong md:hover:shadow-[0_22px_44px_-28px_var(--shadow)]">
      <div className="flex min-w-[200px] grow items-center gap-3 md:gap-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-expense-bg text-expense md:size-11">
          <Bell size={20} className="size-[18px] md:size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold">
            {payment.name} · <span className="num">{formatMoney(payment.amount)}</span> is due today
          </p>
          <p className="mt-0.5 text-xs font-medium text-muted md:text-[13px]">{subline(payment)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex md:gap-1.5">
        <Button
          onClick={dashboard.dismissDue}
          className="border-border bg-surface-2 md:border-transparent md:bg-transparent md:text-muted">
          Later
        </Button>
        <Button variant="solid" onClick={() => void dashboard.actions.pay([payment])}>
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          Mark as paid
        </Button>
      </div>
    </section>
  );
};
