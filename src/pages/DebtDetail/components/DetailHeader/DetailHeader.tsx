import { ChevronLeft, PenLine } from 'lucide-react';
import { Link } from 'react-router';
import { IconButton } from '~/components/ui/IconButton';
import { ROUTES } from '~/constants';
import { aprText, paymentText } from '~/lib/debts';
import { DebtPayment } from '~/lib/debts';
import { usePaymentDialogStore } from '~/state/paymentDialog';

/* Back to Debts, the debt's name with its rate and payment, and edit */
export const DetailHeader = ({ debt }: { debt: DebtPayment }) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);

  return (
    <header className="flex items-center gap-3">
      <Link
        to={ROUTES.debts}
        aria-label="Back to debts"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-hover">
        <ChevronLeft size={20} strokeWidth={2.25} aria-hidden="true" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[22px] leading-tight font-extrabold tracking-[-0.03em] md:text-3xl">
          {debt.name}
        </h1>
        <p className="truncate text-[13px] font-semibold text-muted">
          {debt.debt.apr ? `${aprText(debt.debt.apr)} APR` : 'No interest'} · {paymentText(debt)}
        </p>
      </div>
      <IconButton
        aria-label={`Edit ${debt.name}`}
        variant="outline"
        onClick={() => openEdit('recurring', { paymentId: debt.id, asDebt: true })}>
        <PenLine size={18} aria-hidden="true" />
      </IconButton>
    </header>
  );
};
