import { DebtProgress } from '~/components/debts';
import { PaymentLetter } from '~/components/payments/PaymentParts';
import { DebtPayment, monthlyPayment, paidOffShare } from '~/lib/debts';
import { aprText, clearedText, whenPaid } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { useDebtViewStore } from '~/state/debtView';
import { Debts } from '../../hooks';
import { DebtMenu } from '../DebtMenu';
import { debtRowClasses } from './debtRowClasses';

/* One debt: its rate, what it costs a month, how much is paid off, what's left and when it clears */
export const DebtRow = ({ debt, debts }: { debt: DebtPayment; debts: Debts }) => {
  const openView = useDebtViewStore(s => s.openFor);
  const share = paidOffShare(debt);
  const monthly = monthlyPayment(debt);

  return (
    <div role="row" className={`${debtRowClasses} hover:bg-hover`}>
      <div role="cell" className="flex min-w-0 items-center gap-3">
        <PaymentLetter payment={debt} className="size-[38px] rounded-xl text-sm" />
        <div className="min-w-0">
          <button
            type="button"
            // Opens the debt: what's left, then its small dialogs, with Edit debt
            aria-haspopup="dialog"
            onClick={() => openView(debt.id)}
            className="-my-[11px] block max-w-full min-w-0 cursor-pointer truncate rounded-lg py-[11px] text-left text-[15px] leading-[22px] font-bold hover:text-accent-text hover:underline hover:underline-offset-3">
            {debt.name}
          </button>
          <p className="mt-0.5 truncate text-xs font-medium text-muted">
            <span className="wide:hidden">
              {formatMoney(monthly, { whole: Number.isInteger(monthly) })} a month · clears{' '}
              {clearedText(debts.base.clearedIn[debt.id], debts.today)}
            </span>
            <span className="hidden wide:inline">
              Recurring · {whenPaid(debt)}
              {debt.debt.apr ? '' : ' · no interest'}
            </span>
          </p>
        </div>
      </div>
      <span role="cell" className="num text-sm font-bold">
        {aprText(debt.debt.apr)}
      </span>
      <span role="cell" className="hidden num text-sm font-bold wide:block">
        {formatMoney(monthly, { whole: Number.isInteger(monthly) })}
      </span>
      <span role="cell" className="flex items-center gap-2.5">
        <DebtProgress share={share} className="flex-1" />
        <span className="w-9 text-right num text-[13px] font-semibold text-muted">
          {Math.round(share * 100)}%
        </span>
      </span>
      <span role="cell" className="text-right num text-[15px] font-extrabold">
        {formatMoney(debt.debt.balance)}
      </span>
      <span role="cell" className="hidden text-[13px] font-semibold text-muted wide:block">
        {clearedText(debts.base.clearedIn[debt.id], debts.today)}
      </span>
      <span role="cell" className="flex justify-end">
        <DebtMenu debt={debt} onDelete={() => void debts.actions.remove([debt])} />
      </span>
    </div>
  );
};
