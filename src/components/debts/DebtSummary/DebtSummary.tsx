import { PaymentLetter, summaryCardClasses } from '~/components/payments/PaymentParts';
import { aprText, clearedText, DebtPayment, paidOffShare, simulatePayoff } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD } from '~/lib/payments';
import { DebtProgress } from '../DebtProgress';

interface DebtSummaryProps {
  debt: DebtPayment;
  today: Date;
  // Its name on top, where the title above is about something else, e.g. Update balance
  named?: boolean;
}

/*
 * A debt in the grey card its view and small dialogs lead with: what's left, its rate, payment and
 * when it clears at that payment (as Pay sooner works it out), and how far it's paid off
 */
export const DebtSummary = ({ debt, today, named = false }: DebtSummaryProps) => {
  const share = paidOffShare(debt);
  const cleared = clearedText(simulatePayoff([debt]).months, today);

  return (
    <div className={summaryCardClasses}>
      <PaymentLetter payment={debt} className="size-[38px] rounded-xl text-sm" />
      <div className="min-w-0 flex-1">
        {named ? <p className="text-[15px] font-extrabold">{debt.name}</p> : null}
        <p className={named ? 'mt-0.5 text-[13px] font-extrabold' : 'text-lg font-extrabold'}>
          <span className="num">{formatMoney(debt.debt.balance)}</span>{' '}
          <span className="text-[13px] font-semibold text-muted">left</span>
        </p>
        <p className="mt-0.5 text-xs font-semibold text-muted">
          {debt.debt.apr ? aprText(debt.debt.apr) : 'No interest'} ·{' '}
          {formatMoney(debt.amount, { whole: Number.isInteger(debt.amount) })}{' '}
          {PER_PERIOD[debt.frequency]} ·{' '}
          {cleared === 'Never' ? 'not cleared at this payment' : `clears ${cleared}`}
        </p>
      </div>
      {named ? null : (
        <div className="flex basis-full items-center gap-2.5">
          <DebtProgress share={share} className="flex-1" />
          <span className="num text-xs font-bold text-muted">
            {Math.round(share * 100)}% paid off
          </span>
        </div>
      )}
    </div>
  );
};
