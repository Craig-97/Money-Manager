import { Info } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { DebtPayment } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { useDebtDialogStore } from '~/state/debtDialog';
import { useOverpaymentForm } from './useOverpaymentForm';

interface OverpaymentDialogProps {
  debts: readonly DebtPayment[];
  onOverpay: (debt: DebtPayment, amount: number) => Promise<string | null>;
}

/*
 * Paying extra off a debt today, on top of its usual payments. It all comes off the balance, and
 * off the bank balance too. Opened for one debt, or from the page header to pick which.
 */
export const OverpaymentDialog = ({ debts, onOverpay }: OverpaymentDialogProps) => {
  const { dialog, close } = useDebtDialogStore(
    useShallow(s => ({ dialog: s.dialog, close: s.close }))
  );
  const open = dialog.view === 'overpayment';
  const debtId = dialog.view === 'overpayment' ? dialog.debtId : undefined;
  const form = useOverpaymentForm(
    debts,
    debtId,
    `${dialog.view}-${debtId ?? 'any'}`,
    onOverpay,
    close
  );
  const { debt } = form;

  return (
    <Modal
      open={open && !!debt}
      onOpenChange={next => (next ? undefined : close())}
      title="Log an overpayment"
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={form.save}
            disabled={!form.canSave}
            loading={form.saving}
            className="max-md:h-[52px]">
            Log overpayment
          </Button>
        </>
      }>
      {debt ? (
        <>
          {debtId ? null : (
            <div>
              <Label tone="muted" htmlFor="overpayment-debt">
                Debt
              </Label>
              <Select
                id="overpayment-debt"
                value={debt.id}
                onValueChange={form.choose}
                options={debts.map(item => ({ value: item.id, label: item.name }))}
              />
            </div>
          )}
          <div>
            <Label tone="muted" htmlFor="overpayment-amount">
              Amount
            </Label>
            <AmountInput
              id="overpayment-amount"
              value={form.amountText}
              onChange={event => form.setAmount(event.target.value)}
              onBlur={form.touch}
              placeholder="0.00"
              invalid={!!form.error}
              aria-describedby={form.error ? 'overpayment-amount-error' : 'overpayment-left'}
            />
            {form.error ? (
              <FieldError id="overpayment-amount-error">{form.error}</FieldError>
            ) : (
              <p id="overpayment-left" className="mt-2 ml-1 text-xs font-semibold text-muted">
                <span className="num text-text">{formatMoney(debt.debt.balance)}</span> left on{' '}
                {debt.name}
              </p>
            )}
          </div>
          <p className="flex items-start gap-2.5 rounded-[18px] bg-accent-soft px-4 py-3 text-[13px] leading-[1.4] font-bold text-accent-text">
            <Info size={16} strokeWidth={2.25} className="mt-px shrink-0" aria-hidden="true" />
            It all comes off what you owe, and off your bank balance today. You can undo it until
            payday.
          </p>
        </>
      ) : null}
    </Modal>
  );
};
