import { useShallow } from 'zustand/react/shallow';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { usePaySooner } from '~/hooks/usePaySooner';
import { DebtPayment } from '~/lib/debts';
import { useDebtDialogStore } from '~/state/debtDialog';
import { PaySoonerCard } from '../PaySoonerCard';

interface PaySoonerDialogProps {
  debts: readonly DebtPayment[];
  today: Date;
  onPayMore: (debt: DebtPayment, amount: number) => Promise<void>;
}

/*
 * Desktop: some extra a month on one debt, and what it does to when it clears and the interest on
 * it. Nothing changes until the new payment is applied.
 */
export const PaySoonerDialog = ({ debts, today, onPayMore }: PaySoonerDialogProps) => {
  const { open, debtId, opened, close } = useDebtDialogStore(
    useShallow(s => ({
      open: s.open === 'paySooner',
      debtId: s.paySoonerDebtId,
      opened: s.opened,
      close: s.close
    }))
  );
  // Kept while closing, so it animates away showing what it showed
  const sooner = usePaySooner({
    debt: debts.find(item => item.id === debtId),
    today,
    onPayMore: async (debt, amount) => {
      await onPayMore(debt, amount);
      close();
    },
    formKey: String(opened)
  });

  if (!sooner) return null;

  return (
    <Modal
      open={open}
      onOpenChange={next => (next ? undefined : close())}
      title={`Pay ${sooner.debt.name} sooner`}
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={sooner.apply}
            disabled={!sooner.applyLabel}
            loading={sooner.applying}
            className="max-md:h-[52px]">
            {sooner.applyLabel ?? 'Pay more'}
          </Button>
        </>
      }>
      <PaySoonerCard sooner={sooner} />
      <p className="px-2 text-center text-xs font-medium text-muted">
        Estimates from your {sooner.debt.debt.apr.toFixed(1)}% APR. Your statement is the final
        word.
      </p>
    </Modal>
  );
};
