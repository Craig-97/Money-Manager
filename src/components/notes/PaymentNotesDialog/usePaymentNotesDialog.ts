import { useShallow } from 'zustand/react/shallow';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { followPayments, notesByPayment, toNotes } from '~/lib/notes';
import { toPayments } from '~/lib/payments';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentNotesStore } from '~/state/paymentNotes';
import { usePaymentSheetStore } from '~/state/paymentSheet';

/*
 * A payment's notes: which payment, its notes newest first, and where each button goes. A note
 * opens in the note dialog, which comes back here when it closes.
 */
export const usePaymentNotesDialog = () => {
  const { budget } = useBudget();
  const { today } = usePayCycle(budget?.payday);
  const { paymentId, fromSheet, open, close } = usePaymentNotesStore(
    useShallow(s => ({
      paymentId: s.paymentId,
      fromSheet: s.fromSheet,
      open: s.open,
      close: s.close
    }))
  );
  const { openNewFor, openEdit } = useNoteDialogStore(
    useShallow(s => ({ openNewFor: s.openNewFor, openEdit: s.openEdit }))
  );
  const openSheet = usePaymentSheetStore(s => s.openFor);

  const payments = budget ? toPayments(budget, today) : [];
  const payment = payments.find(item => item.id === paymentId && item.kind === 'recurring');
  // Notes that follow the payment take its next date, so their reminder reads right
  const notes = payment
    ? (notesByPayment(followPayments(toNotes(budget?.notes), payments)).get(payment.id) ?? [])
    : [];
  const backTo = payment ? { paymentId: payment.id, fromSheet } : undefined;

  return {
    // A payment that's gone, e.g. deleted elsewhere, has no notes to show
    open: open && !!payment,
    payment: payment?.kind === 'recurring' ? payment : null,
    notes,
    today,
    fromSheet,
    close,
    // Back to the payment's sheet it came from on mobile
    back: () => {
      close();
      if (payment) openSheet(payment.id);
    },
    add: () => {
      if (!backTo) return;
      close();
      openNewFor(backTo.paymentId, { backTo });
    },
    edit: (noteId: string) => {
      close();
      openEdit(noteId, { backTo });
    }
  };
};
