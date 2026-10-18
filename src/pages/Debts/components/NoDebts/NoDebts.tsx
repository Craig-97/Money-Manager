import { Plus } from 'lucide-react';
import { DebtsIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';
import { usePaymentDialogStore } from '~/state/paymentDialog';

/* No recurring payments are tracked as debts yet */
export const NoDebts = () => {
  const openAddDebt = usePaymentDialogStore(s => s.openAddDebt);

  return (
    <div className="flex flex-col items-center gap-1.5 px-3 pt-7 pb-6 text-center md:px-4 md:pt-9 md:pb-8">
      <span
        aria-hidden="true"
        className="mb-2 inline-flex size-[52px] items-center justify-center rounded-[18px] bg-accent-soft text-accent-text">
        <DebtsIcon size={24} />
      </span>
      <p className="text-base font-extrabold tracking-[-0.01em]">No debts yet</p>
      <p className="mb-2.5 text-[13px] font-medium text-muted">
        Cards and loans you're paying off will show here
      </p>
      <Button variant="accent" onClick={openAddDebt}>
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
        Add a debt
      </Button>
    </div>
  );
};
