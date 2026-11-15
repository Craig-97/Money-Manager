import { useBackToDebt } from '~/hooks/useBackToDebt';
import { DebtPayment } from '~/lib/debts';
import { BalanceDialog } from '../../form';
import { ChangePreview } from '../../ui';
import { DebtSummary } from '../DebtSummary';
import { useUpdateBalance } from './useUpdateBalance';

interface UpdateBalanceDialogProps {
  debts: readonly DebtPayment[];
  today: Date;
  onUpdate: (debt: DebtPayment, balance: number) => Promise<boolean>;
}

/* Update balance for a debt: what's left on it, from a statement */
export const UpdateBalanceDialog = ({ debts, today, onUpdate }: UpdateBalanceDialogProps) => {
  const form = useUpdateBalance({ debts, today, onUpdate });
  const back = useBackToDebt(form?.debt.id);
  if (!form) return null;
  const { debt } = form;

  return (
    <BalanceDialog
      form={form}
      id="debt-balance-now"
      summary={<DebtSummary debt={debt} today={today} named />}
      hint="From your latest statement. Balances after it are worked out from your APR again."
      onBack={back}
      backLabel={`Back to ${debt.name}`}>
      {form.cleared ? (
        <ChangePreview label="Cleared" before={form.cleared.before} after={form.cleared.after} />
      ) : null}
    </BalanceDialog>
  );
};
