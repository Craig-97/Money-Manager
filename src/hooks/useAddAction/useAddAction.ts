import { useMatch } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { ROUTES } from '~/constants';
import { useNoteComposerStore } from '~/state/noteComposer';
import { usePaymentDialogStore } from '~/state/paymentDialog';

export interface AddAction {
  label: string;
  open: () => void;
  // Opens the payment dialog; the note composer is part of the notes page
  dialog: boolean;
}

/*
 * What the mobile nav's add button adds: what the page is about on Recurring, Debts and Notes,
 * otherwise it asks which kind of payment.
 */
export const useAddAction = (): AddAction => {
  const { openChooser, openAdd } = usePaymentDialogStore(
    useShallow(s => ({ openChooser: s.openChooser, openAdd: s.openAdd }))
  );
  const openNote = useNoteComposerStore(s => s.openComposer);
  const onRecurring = useMatch(ROUTES.recurring) !== null;
  const onDebts = useMatch(ROUTES.debts) !== null;
  const onNotes = useMatch(ROUTES.notes) !== null;

  if (onNotes) return { label: 'Add note', open: openNote, dialog: false };
  if (onRecurring) {
    return { label: 'Add recurring payment', open: () => openAdd('recurring'), dialog: true };
  }
  // The recurring form, until it can start as a debt
  if (onDebts) return { label: 'Add a debt', open: () => openAdd('recurring'), dialog: true };
  return { label: 'Add payment', open: openChooser, dialog: true };
};
