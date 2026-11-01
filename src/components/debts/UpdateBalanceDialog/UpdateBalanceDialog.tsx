import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Button } from '~/components/ui/Button';
import { ChangePreview } from '~/components/ui/ChangePreview';
import { Modal } from '~/components/ui/Modal';
import { useBackToDebt } from '~/hooks/useBackToDebt';
import { DebtPayment } from '~/lib/debts';
import { DebtSummary } from '../DebtSummary';
import { useUpdateBalance } from './useUpdateBalance';

interface UpdateBalanceDialogProps {
  debts: readonly DebtPayment[];
  today: Date;
  onUpdate: (debt: DebtPayment, balance: number) => Promise<boolean>;
}

/*
 * Update balance: what's left on a debt, from a statement, as Change amount is for a payment. A
 * small dialog on desktop, a sheet on a phone. Edit debt has everything else.
 */
export const UpdateBalanceDialog = ({ debts, today, onUpdate }: UpdateBalanceDialogProps) => {
  const form = useUpdateBalance({ debts, today, onUpdate });
  const back = useBackToDebt(form?.debt.id);
  if (!form) return null;
  const { debt } = form;

  return (
    <Modal
      open={form.open}
      onOpenChange={next => (next ? undefined : form.close())}
      title="Update balance"
      onBack={back}
      backLabel={`Back to ${debt.name}`}
      initialFocusId="debt-balance-now"
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={form.close}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={form.save}
            disabled={!form.canSave}
            loading={form.saving}>
            Save
          </Button>
        </>
      }>
      <DebtSummary debt={debt} today={today} named />
      <div>
        <Label tone="muted" htmlFor="debt-balance-now">
          Balance now
        </Label>
        <AmountInput
          id="debt-balance-now"
          value={form.draft}
          onChange={event => form.setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') form.save();
          }}
          placeholder="0.00"
          invalid={!!form.error}
          aria-describedby={form.error ? 'debt-balance-now-error' : 'debt-balance-now-hint'}
        />
        {form.error ? (
          <FieldError id="debt-balance-now-error">{form.error}</FieldError>
        ) : (
          <p
            id="debt-balance-now-hint"
            className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">
            From your latest statement. Balances after it are worked out from your APR again.
          </p>
        )}
      </div>
      {form.cleared ? (
        <ChangePreview label="Cleared" before={form.cleared.before} after={form.cleared.after} />
      ) : null}
    </Modal>
  );
};
