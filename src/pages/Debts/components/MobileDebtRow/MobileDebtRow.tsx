import { ChevronRight } from 'lucide-react';
import { DebtProgress } from '~/components/debts';
import { PaymentLetter } from '~/components/payments/PaymentParts';
import { DebtPayment, paidOffShare } from '~/lib/debts';
import { aprText, clearedText, paymentText } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { useDebtViewStore } from '~/state/debtView';

interface MobileDebtRowProps {
  debt: DebtPayment;
  clearedIn: number | null | undefined;
  today: Date;
}

/*
 * One debt: what's left, how far it's paid off, its rate and payment, and when it clears. Tapping it
 * opens its view, as a sheet.
 */
export const MobileDebtRow = ({ debt, clearedIn, today }: MobileDebtRowProps) => {
  const openView = useDebtViewStore(s => s.openFor);
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => openView(debt.id)}
      className="flex min-h-[76px] w-full cursor-pointer items-center gap-3 rounded-[18px] px-2.5 py-2 text-left text-text transition-colors hover:bg-hover">
      <PaymentLetter payment={debt} className="size-10 rounded-[13px] text-[15px]" />
      <span className="flex min-w-0 grow flex-col gap-1.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-bold">{debt.name}</span>
          <span className="num text-[15px] font-extrabold">
            {formatMoney(debt.debt.balance, { whole: true })}
          </span>
        </span>
        <DebtProgress share={paidOffShare(debt)} />
        <span className="flex items-center justify-between gap-2 text-xs font-medium text-muted">
          <span className="truncate">
            {debt.debt.apr ? aprText(debt.debt.apr) : 'No interest'} · {paymentText(debt)}
          </span>
          <span className="shrink-0 font-semibold">{clearedText(clearedIn, today)}</span>
        </span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-faint" aria-hidden="true" />
    </button>
  );
};
