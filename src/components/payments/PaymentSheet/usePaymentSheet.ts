import { useShallow } from 'zustand/react/shallow';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { notesByPayment, toNotes } from '~/lib/notes';
import {
  datesDue,
  dueInfo,
  formatShortDate,
  paymentChoices,
  quickEdits,
  toPayments
} from '~/lib/payments';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { usePaymentNotesStore } from '~/state/paymentNotes';
import { usePaymentSheetStore } from '~/state/paymentSheet';
import { useQuickEditStore } from '~/state/quickEdit';

/*
 * The payment a row opened on mobile, what can be done with it now, and its notes. Each action
 * closes the sheet; notes and Add a note hand over to dialogs that come back to its notes.
 */
export const usePaymentSheet = () => {
  const { budget } = useBudget();
  const { today, cycle } = usePayCycle(budget?.payday);
  const actions = usePaymentActions(budget?.id ?? '');
  const { paymentId, open, close } = usePaymentSheetStore(
    useShallow(s => ({ paymentId: s.paymentId, open: s.open, close: s.close }))
  );
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const openNotes = usePaymentNotesStore(s => s.openFor);
  const openNewNote = useNoteDialogStore(s => s.openNewFor);
  const openQuickEdit = useQuickEditStore(s => s.openFor);

  const payment = budget
    ? toPayments(budget, today).find(item => item.id === paymentId)
    : undefined;
  if (!payment) return { open: false, payment: null } as const;

  const recurring = payment.kind === 'recurring' ? payment : null;
  const notes = recurring ? (notesByPayment(toNotes(budget?.notes)).get(recurring.id) ?? []) : [];
  // A weekly payment can fall more than once before payday; it lists each date
  const dates = datesDue(payment, cycle);
  const then = (run: () => void) => () => {
    close();
    run();
  };

  const choices = paymentChoices(payment, { cycle, today });
  // A payment due more than once before payday says which date Mark as paid ticks off underneath,
  // rather than in the label as the menu does
  const next = choices.pay && dates.length > 1 ? payment.dueDate : null;

  return {
    open,
    payment,
    recurring,
    today,
    due: dueInfo(payment, { today, cycle }),
    dates: dates.length > 1 ? dates : [],
    choices,
    edits: quickEdits(payment),
    payLabel: next ? 'Mark as paid' : choices.pay,
    payDetail: next ? `Ticks off ${formatShortDate(next, today)}` : null,
    notes,
    close,
    pay: then(() => void actions.pay([payment])),
    undo: then(() => void actions.undo(payment)),
    skip: then(() => {
      if (recurring) void actions.skip(recurring);
    }),
    edit: then(() => openEdit(payment.kind, { paymentId: payment.id })),
    // Change amount and Change date come back here with their back arrow
    changeAmount: then(() => openQuickEdit(payment.id, { mode: 'amount', fromSheet: true })),
    changeDate: then(() => openQuickEdit(payment.id, { mode: 'date', fromSheet: true })),
    showNotes: then(() => {
      if (recurring) openNotes(recurring.id, { fromSheet: true });
    }),
    addNote: then(() => {
      if (recurring) {
        openNewNote(recurring.id, { backTo: { paymentId: recurring.id, fromSheet: true } });
      }
    })
  } as const;
};
