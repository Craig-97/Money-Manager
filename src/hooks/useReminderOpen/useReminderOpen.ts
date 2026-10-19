import { useNavigate } from 'react-router';
import { ROUTES } from '~/constants';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { Reminder } from '~/lib/reminders';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';

export interface ReminderOpen {
  label: string;
  run: () => void;
  // A second thing to do, e.g. the note about a renewal beside updating it
  also?: { label: string; run: () => void } | null;
}

/*
 * What to do about a reminder, if anything: pay a payment, update a renewal (as the dashboard's
 * alert does), open the note it's about, or start the new cycle on the dashboard. A renewal with a
 * note about it offers the note as well.
 */
export const useReminderOpen = (budgetId: string) => {
  const navigate = useNavigate();
  const openPayment = usePaymentDialogStore(s => s.openEdit);
  const openNote = useNoteDialogStore(s => s.openEdit);
  const { pay } = usePaymentActions(budgetId);

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
      case 'renewal': {
        const update = editPayment('Update');
        return update ? { ...update, also: noteOpen } : noteOpen;
      }
      case 'renewed': {
        const next = editPayment('Set next renewal');
        return next ? { ...next, also: noteOpen } : noteOpen;
      }
      case 'note':
        return noteOpen;
      case 'payday':
        return reminder.awaitingStart
          ? { label: 'Open dashboard', run: () => void navigate(ROUTES.dashboard) }
          : null;
    }
  };
};
