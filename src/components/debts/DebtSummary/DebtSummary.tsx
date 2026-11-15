import { estimateText } from '~/lib/accounts';
import { formatShortDate } from '~/lib/dates';
import {
  aprText,
  clearedText,
  DebtPayment,
  debtInterestSince,
  paidOffShare,
  pendingDebtInterest,
  simulatePayoff
} from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD } from '~/lib/payments';
import { InterestStrip } from '../../accounts';
import { PaymentLetter, summaryCardClasses } from '../../payments';
import { DebtProgress } from '../DebtProgress';

interface DebtSummaryProps {
  debt: DebtPayment;
  today: Date;
  // Its name on top, where the title above is about something else, e.g. Update balance
  named?: boolean;
}

/*
 * A debt in the grey card its view and small dialogs lead with: what's left, its rate, payment and
 * when it clears at that payment (as Pay sooner works it out), and how far it's paid off. In its
 * view, the interest built up since the last payment, which goes on before the next one comes off.
 */
export const DebtSummary = ({ debt, today, named = false }: DebtSummaryProps) => {
  const share = paidOffShare(debt);
  const cleared = clearedText(simulatePayoff([debt]).months, today);
  const since = debtInterestSince(debt);

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
      {!named && debt.debt.apr > 0 && debt.dueDate ? (
        <div className="flex basis-full flex-col gap-2">
          <InterestStrip
            line={{
              tone: 'earning',
              short: `Pending interest ${formatMoney(pendingDebtInterest(debt.debt, today))}`,
              when: `Added ${formatShortDate(debt.dueDate, today)}`
            }}
          />
          <p className="text-xs leading-[1.45] font-semibold text-muted">
            {estimateText(since, today)} The payment comes off after it.
          </p>
        </div>
      ) : null}
    </div>
  );
};
