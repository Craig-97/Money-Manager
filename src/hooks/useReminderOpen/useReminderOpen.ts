import { useNavigate } from 'react-router';
import { ROUTES } from '~/constants';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { Reminder } from '~/lib/reminders';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';

export interface ReminderOpen {
  label: string;
  run: () => void;
}

/*
 * The one thing to do about a reminder, if there is one: pay a payment, open the note or payment
 * it's about, or start the new cycle on the dashboard.
 */
export const useReminderOpen = (accountId: string) => {
  const navigate = useNavigate();
  const openPayment = usePaymentDialogStore(s => s.openEdit);
  const openNote = useNoteDialogStore(s => s.openEdit);
  const { pay } = usePaymentActions(accountId);

  return (reminder: Reminder): ReminderOpen | null => {
    const { payment } = reminder;
    const editPayment = (label: string) =>
      payment ? { label, run: () => openPayment(payment.kind, { paymentId: payment.id }) } : null;
    const note = reminder.note ?? reminder.paymentNote;
    const noteOpen = note ? { label: 'Open note', run: () => openNote(note.id) } : null;

    switch (reminder.kind) {
      case 'due':
      case 'overdue':
        return payment ? { label: 'Mark as paid', run: () => void pay([payment]) } : null;
      case 'renewal':
        return noteOpen ?? editPayment('Open payment');
      case 'renewed':
        return editPayment('Set next renewal');
      case 'note':
        return noteOpen;
      case 'payday':
        return reminder.awaitingStart
          ? { label: 'Open dashboard', run: () => void navigate(ROUTES.dashboard) }
          : null;
    }
  };
};
