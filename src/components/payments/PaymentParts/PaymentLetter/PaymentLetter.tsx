import { cn } from '~/lib/cn';
import { movesTo, Payment } from '~/lib/payments';

interface PaymentLetterProps {
  payment: Payment;
  className?: string;
}

/*
 * The payment's initial, tinted by which way the money goes. Money moving between two accounts that
 * count is grey, as it neither goes out nor comes in, and outlined so it stands out on a grey card.
 */
export const PaymentLetter = ({ payment, className }: PaymentLetterProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-flex shrink-0 items-center justify-center font-extrabold',
      movesTo(payment)
        ? 'bg-surface-2 text-muted ring-1 ring-border-strong ring-inset'
        : payment.type === 'INCOME'
          ? 'bg-income-bg text-income'
          : 'bg-expense-bg text-expense',
      className
    )}>
    {(payment.name.trim().charAt(0) || '?').toUpperCase()}
  </span>
);
