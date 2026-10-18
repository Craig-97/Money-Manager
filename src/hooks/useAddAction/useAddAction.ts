import { useMatch } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { ROUTES } from '~/constants';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { useReminderChooserStore } from '~/state/reminderChooser';

export interface AddAction {
  label: string;
  // Opens a dialog: the note dialog, or the payment one
  open: () => void;
}

/*
 * What the mobile nav's add button adds: what the page is about on Recurring, Debts and Notes, a
 * note with a date or a recurring payment on Reminders, otherwise it asks which kind of payment.
 */
export const useAddAction = (): AddAction => {
  const { openChooser, openAdd, openAddDebt } = usePaymentDialogStore(
    useShallow(s => ({
      openChooser: s.openChooser,
      openAdd: s.openAdd,
      openAddDebt: s.openAddDebt
    }))
  );
  const openNote = useNoteDialogStore(s => s.openNew);
  const openReminderChooser = useReminderChooserStore(s => s.show);
  const onReminders = useMatch(ROUTES.reminders) !== null;
  const onRecurring = useMatch(ROUTES.recurring) !== null;
  // A debt's own page too
  const onDebts = useMatch({ path: ROUTES.debts, end: false }) !== null;
  const onNotes = useMatch(ROUTES.notes) !== null;

  if (onNotes) return { label: 'Add note', open: openNote };
  if (onReminders) return { label: 'Add a reminder', open: openReminderChooser };
  if (onRecurring) {
    return { label: 'Add recurring payment', open: () => openAdd('recurring') };
  }
  if (onDebts) return { label: 'Add a debt', open: openAddDebt };
  return { label: 'Add payment', open: openChooser };
};
