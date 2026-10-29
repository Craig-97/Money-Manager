import {
  Check,
  Ellipsis,
  FastForward,
  FileText,
  PenLine,
  SkipForward,
  Trash,
  Undo2
} from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { PaymentActions } from '~/hooks/usePaymentActions';
import { PayCycle } from '~/lib/payday';
import { Payment, paymentChoices } from '~/lib/payments';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { usePaymentNotesStore } from '~/state/paymentNotes';

interface PaymentMenuProps {
  payment: Payment;
  cycle: PayCycle;
  today: Date;
  actions: PaymentActions;
  // How many notes it has; a recurring payment's menu lists them, or offers to add the first
  noteCount?: number;
}

/* Edit, pay, undo, skip, its notes and delete, from the row's more button */
export const PaymentMenu = ({
  payment,
  cycle,
  today,
  actions,
  noteCount = 0
}: PaymentMenuProps) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const openNotes = usePaymentNotesStore(s => s.openFor);
  const openNewNote = useNoteDialogStore(s => s.openNewFor);
  const { pay, undo, skip, remove } = actions;
  const choices = paymentChoices(payment, { cycle, today });
  const recurring = payment.kind === 'recurring' ? payment : null;

  return (
    <Menu>
      <MenuTrigger>
        <IconButton aria-label={`More actions for ${payment.name}`}>
          <Ellipsis size={18} aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent aria-label={`Actions for ${payment.name}`}>
        <MenuItem
          icon={<PenLine size={16} />}
          onSelect={() => openEdit(payment.kind, { paymentId: payment.id })}>
          Edit
        </MenuItem>
        {choices.pay ? (
          <MenuItem
            icon={<Check size={16} strokeWidth={2.5} />}
            onSelect={() => void pay([payment])}>
            {choices.pay}
          </MenuItem>
        ) : null}
        {choices.undo ? (
          <MenuItem icon={<Undo2 size={16} />} onSelect={() => void undo(payment)}>
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
        {recurring ? (
          <MenuItem
            icon={<FileText size={16} />}
            onSelect={() => (noteCount ? openNotes(recurring.id) : openNewNote(recurring.id))}>
            {noteCount ? `Notes (${noteCount})` : 'Add a note'}
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
