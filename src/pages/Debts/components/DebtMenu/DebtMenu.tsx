import { ArrowUp, Ellipsis, History, PenLine, RefreshCw, Trash } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { DebtPayment } from '~/lib/debts';
import { useDebtDialogStore } from '~/state/debtDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';

interface DebtMenuProps {
  debt: DebtPayment;
  onDelete: () => void;
}

/* Edit, update the balance, overpay, see payments and delete, from the row's more button */
export const DebtMenu = ({ debt, onDelete }: DebtMenuProps) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const { openOverpayment, openPayments } = useDebtDialogStore(
    useShallow(s => ({ openOverpayment: s.openOverpayment, openPayments: s.openPayments }))
  );

  return (
    <Menu>
      <MenuTrigger>
        <IconButton aria-label={`More actions for ${debt.name}`}>
          <Ellipsis size={18} aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent aria-label={`Actions for ${debt.name}`}>
        <MenuItem
          icon={<PenLine size={16} />}
          onSelect={() => openEdit('recurring', { paymentId: debt.id, asDebt: true })}>
          Edit
        </MenuItem>
        <MenuItem
          icon={<RefreshCw size={16} />}
          onSelect={() =>
            openEdit('recurring', { paymentId: debt.id, asDebt: true, focusBalance: true })
          }>
          Update balance
        </MenuItem>
        <MenuItem icon={<ArrowUp size={16} />} onSelect={() => openOverpayment(debt.id)}>
          Log an overpayment
        </MenuItem>
        <MenuItem icon={<History size={16} />} onSelect={() => openPayments(debt.id)}>
          See payments
        </MenuItem>
        <MenuSeparator />
        <MenuItem danger icon={<Trash size={16} />} onSelect={onDelete}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};
