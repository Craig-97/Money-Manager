import { cn } from '~/lib/cn';
import { DebtPayment, paidOffShare } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { DebtProgress } from '../DebtProgress';

/* Under a debt's name in payment lists: how far it's paid off, and what's left */
export const DebtLeft = ({ debt, className }: { debt: DebtPayment; className?: string }) => (
  <span className={cn('flex min-w-0 items-center gap-2', className)}>
    <DebtProgress share={paidOffShare(debt)} className="w-[72px] shrink-0" />
    <span className="truncate">
      <span className="mr-0.5 num font-semibold text-text">
        {formatMoney(debt.debt.balance, { whole: true })}
      </span>{' '}
      left
    </span>
  </span>
);
