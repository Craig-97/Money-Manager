import { Bell, Check } from 'lucide-react';
import { Alert } from '~/components/alerts';
import { formatMoney } from '~/lib/format';
import { categoryLabel, FREQUENCY_LABELS, Payment } from '~/lib/payments';

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
  onClear: () => void;
}

/* Something due today, with a shortcut to mark it paid */
export const DueTodayAlert = ({ payment, onLater, onPay, onClear }: DueTodayAlertProps) => (
  <Alert
    icon={Bell}
    tone="expense"
    title={
      <>
        {payment.name} · <span className="num">{formatMoney(payment.amount)}</span> is due today
      </>
    }
    subline={subline(payment)}
    onLater={onLater}
    action={{ label: 'Mark as paid', icon: Check, onClick: onPay }}
    onClear={onClear}
    clearLabel={`${payment.name} is due today`}
  />
);
