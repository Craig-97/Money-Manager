import { Bell, Check } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { formatMoney } from '~/lib/format';
import { categoryLabel, FREQUENCY_LABELS, Payment } from '~/lib/payments';
import { laterClasses } from '../alertClasses';

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

interface DueTodayAlertProps {
  payment: Payment;
  onLater: () => void;
  onPay: () => void;
}

/* Something due today, with a shortcut to mark it paid */
export const DueTodayAlert = ({ payment, onLater, onPay }: DueTodayAlertProps) => (
  <>
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
      <Button onClick={onLater} className={laterClasses}>
        Later
      </Button>
      <Button variant="solid" onClick={onPay}>
        <Check size={16} strokeWidth={2.5} aria-hidden="true" />
        Mark as paid
      </Button>
    </div>
  </>
);
