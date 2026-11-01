import { ArrowUp, History, PenLine, RefreshCw, Timer } from 'lucide-react';
import { ActionRow } from '~/components/ui/ActionRow';
import { ActionRows } from '~/components/ui/ActionRows';
import { ActionTile } from '~/components/ui/ActionTile';
import { ActionTiles } from '~/components/ui/ActionTiles';
import { Modal } from '~/components/ui/Modal';
import { DebtSummary } from '../DebtSummary';
import { useDebtSheet } from './useDebtSheet';

/*
 * A debt's view, as a payment's quick view is: what's left and when it clears, then its small
 * dialogs as tiles, and Edit debt for the full form. A dialog on desktop, a sheet on a phone, from
 * its name on Debts or View debt on its payment.
 */
export const DebtSheet = () => {
  const sheet = useDebtSheet();
  if (!sheet.debt) return null;
  const { debt } = sheet;

  return (
    <Modal
      open={sheet.open}
      onOpenChange={next => (next ? undefined : sheet.close())}
      title={debt.name}>
      <DebtSummary debt={debt} today={sheet.today} />
      <ActionTiles>
        <ActionTile
          icon={<RefreshCw size={20} />}
          label="Update balance"
          onClick={sheet.updateBalance}
        />
        <ActionTile
          icon={<ArrowUp size={20} />}
          label="Log an overpayment"
          onClick={sheet.overpay}
        />
        <ActionTile icon={<Timer size={20} />} label="Pay sooner" onClick={sheet.paySooner} />
        <ActionTile icon={<History size={20} />} label="See payments" onClick={sheet.payments} />
      </ActionTiles>
      <ActionRows>
        <ActionRow icon={<PenLine size={18} />} onClick={sheet.edit} chevron>
          Edit debt
        </ActionRow>
      </ActionRows>
    </Modal>
  );
};
