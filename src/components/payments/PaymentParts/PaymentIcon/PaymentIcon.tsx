import { movesTo, Payment, paymentLetter } from '~/lib/payments';
import { LetterIcon } from '../../../ui';

interface PaymentIconProps {
  payment: Payment;
  className?: string;
}

/*
 * The payment's logo, or its initial tinted by which way the money goes. Money moving between two
 * accounts that count is grey, as it neither goes out nor comes in, and outlined so it stands out
 * on a grey card.
 */
export const PaymentIcon = ({ payment, className }: PaymentIconProps) => (
  <LetterIcon
    letter={paymentLetter(payment.name)}
    iconUrl={payment.iconUrl}
    className={className}
    letterClassName={
      movesTo(payment)
        ? 'bg-surface-2 text-muted ring-1 ring-border-strong ring-inset'
        : payment.type === 'INCOME'
          ? 'bg-income-bg text-income'
          : 'bg-expense-bg text-expense'
    }
  />
);
