import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { isDebt } from '~/lib/debts';
import { formatMoney, formatPayment } from '~/lib/format';
import {
  categoryLabel,
  DueInfo,
  FREQUENCY_LABELS,
  intoText,
  movesTo,
  Payment
} from '~/lib/payments';
import { PaymentLetter } from '../PaymentLetter';
import { summaryCardClasses } from './summaryCardClasses';

interface PaymentSummaryProps {
  payment: Payment;
  due: DueInfo;
  // Its name on top, where the title above is about something else, e.g. Change amount
  named?: boolean;
  // More under it, across the card, e.g. its dates before payday
  children?: ReactNode;
}

/*
 * A payment in a grey card, as the quick sheet and quick edits show it: its letter, the amount and
 * when it's due, red when that's today or overdue, then how often and what it's for.
 */
export const PaymentSummary = ({ payment, due, named = false, children }: PaymentSummaryProps) => {
  const urgent = due.state === 'today' || due.state === 'overdue';
  return (
    <div className={summaryCardClasses}>
      <PaymentLetter payment={payment} className="size-[38px] rounded-xl text-sm" />
      <div className="min-w-0 flex-1">
        {named ? <p className="text-[15px] font-extrabold">{payment.name}</p> : null}
        <p className={cn('font-extrabold', named ? 'mt-0.5 text-[13px]' : 'text-base')}>
          <span className="num">{formatPayment(payment.signedAmount)}</span> ·{' '}
          <span className={cn(urgent && 'text-expense')}>
            {due.state === 'today'
              ? 'Due today'
              : due.state === 'overdue'
                ? `Overdue · ${due.label}`
                : due.label}
          </span>
        </p>
        <p className="mt-0.5 text-xs font-semibold text-muted">
          {payment.kind === 'recurring'
            ? `${FREQUENCY_LABELS[payment.frequency]} · `
            : 'One-off · '}
          {payment.kind === 'recurring' && isDebt(payment)
            ? `Debt · ${formatMoney(payment.debt.balance)} left`
            : (intoText(payment) ?? categoryLabel(payment.category))}
          {movesTo(payment) ? ' · Not in totals' : null}
        </p>
      </div>
      {children}
    </div>
  );
};
