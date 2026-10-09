import { Check, Ellipsis, FastForward, PenLine, SkipForward, Trash, Undo2 } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { PaymentActions } from '~/hooks/usePaymentActions';
import { PayCycle } from '~/lib/payday';
import { Payment, paymentChoices } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';

interface PaymentMenuProps {
  payment: Payment;
  cycle: PayCycle;
  today: Date;
  actions: PaymentActions;
}

/* Edit, pay, undo, skip and delete, from the row's more button */
export const PaymentMenu = ({ payment, cycle, today, actions }: PaymentMenuProps) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const { pay, undo, skip, remove } = actions;
  const choices = paymentChoices(payment, cycle, today);
  const recurring = payment.kind === 'recurring' ? payment : null;

  return (
    <Menu>
      <MenuTrigger>
        <IconButton aria-label={`More actions for ${payment.name}`}>
          <Ellipsis size={18} aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent aria-label={`Actions for ${payment.name}`}>
        <MenuItem icon={<PenLine size={16} />} onSelect={() => openEdit(payment.kind, payment.id)}>
          Edit
        </MenuItem>
        {choices.pay ? (
          <MenuItem
            icon={<Check size={16} strokeWidth={2.5} />}
            onSelect={() => void pay([payment])}>
            {choices.pay}
          </MenuItem>
        ) : null}
        {recurring && choices.undo ? (
          <MenuItem icon={<Undo2 size={16} />} onSelect={() => void undo(recurring)}>
            {choices.undo}
          </MenuItem>
        ) : null}
        {recurring && choices.skipNext ? (
          <MenuItem icon={<SkipForward size={16} />} onSelect={() => void skip(recurring)}>
            {choices.skipNext}
          </MenuItem>
        ) : null}
        {recurring && choices.skipRest ? (
          <MenuItem
            icon={<FastForward size={16} />}
            onSelect={() => void skip(recurring, cycle.end)}>
            {choices.skipRest}
          </MenuItem>
        ) : null}
        <MenuSeparator />
        <MenuItem danger icon={<Trash size={16} />} onSelect={() => void remove([payment])}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};
