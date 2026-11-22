import { cn } from '~/lib/cn';
import { DebtPayment, paidOffShare } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { DebtProgress } from '../DebtProgress';

/*
 * Under a debt's name in payment lists: how far it's paid off, and what's left. In a tight row the
 * bar gives up its width first, down to 32px, then "left" moves under the amount, which never
 * breaks.
 */
export const DebtLeft = ({ debt, className }: { debt: DebtPayment; className?: string }) => (
  <span className={cn('flex min-w-0 items-center gap-2', className)}>
    <DebtProgress share={paidOffShare(debt)} className="w-[72px] min-w-8 shrink-9" />
    <span className="md:min-w-0 md:truncate">
      <span className="mr-0.5 num font-semibold whitespace-nowrap text-text">
        {formatMoney(debt.debt.balance, { whole: true })}
      </span>{' '}
      left
    </span>
  </span>
);
