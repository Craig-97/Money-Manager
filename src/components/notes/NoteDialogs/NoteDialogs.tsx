import { NoteDialog } from '../NoteDialog';
import { PaymentNotesDialog } from '../PaymentNotesDialog';

/* A note's dialog and a payment's notes, once for the whole app, so a note opens from any page */
export const NoteDialogs = () => (
  <>
    <PaymentNotesDialog />
    <NoteDialog />
  </>
);
