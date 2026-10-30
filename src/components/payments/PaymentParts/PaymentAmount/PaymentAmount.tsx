import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { movesTo, Payment } from '~/lib/payments';

interface PaymentAmountProps {
  payment: Payment;
  className?: string;
  // Without the hover card, where there's no hover; the line under the name says it instead
  hint?: boolean;
}

/*
 * A row's amount: red going out, green coming in. Money moving between two accounts that count
 * isn't spent, so it's grey, and hover or focus says why it isn't in the totals.
 */
export const PaymentAmount = ({ payment, className, hint = true }: PaymentAmountProps) => {
  const into = movesTo(payment);
  const amount = (
    <span
      tabIndex={into && hint ? 0 : undefined}
      className={cn(
        'num font-extrabold',
        into
          ? cn('text-muted', hint && 'cursor-help rounded-md')
          : payment.signedAmount < 0
            ? 'text-expense'
            : 'text-income',
        className
      )}>
      {formatPayment(payment.signedAmount)}
    </span>
  );
  if (!into || !hint) return amount;
  return (
    <Tooltip
      side="top"
      tone="card"
      label={
        <>
          <span className="font-bold">Moves to {into}</span>
          <span>Both accounts count, so it isn&apos;t in the totals</span>
        </>
      }>
      {amount}
    </Tooltip>
  );
};
