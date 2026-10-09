import { cn } from '~/lib/cn';
import { Payment } from '~/lib/payments';

/* The payment's initial, tinted by which way the money goes */
export const PaymentLetter = ({ payment, className }: { payment: Payment; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-flex shrink-0 items-center justify-center font-extrabold',
      payment.type === 'INCOME' ? 'bg-income-bg text-income' : 'bg-expense-bg text-expense',
      className
    )}>
    {(payment.name.trim().charAt(0) || '?').toUpperCase()}
  </span>
);
