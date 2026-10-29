import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/Button';
import { buttonVariants } from '~/components/ui/Button/buttonVariants';
import { Modal } from '~/components/ui/Modal';
import { ROUTES } from '~/constants';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD } from '~/lib/payments';
import { PaymentNoteCard } from '../PaymentNoteCard';
import { usePaymentNotesDialog } from './usePaymentNotesDialog';

/*
 * "Notes on Cleaner": a payment's notes in their colours, from its note chip or menu, or its sheet
 * on mobile. Clicking one opens it to change; Add a note writes one already linked to the payment.
 */
export const PaymentNotesDialog = () => {
  const dialog = usePaymentNotesDialog();
  const { payment, notes } = dialog;
  if (!payment) return null;

  return (
    <Modal
      open={dialog.open}
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={`Notes on ${payment.name}`}
      subtitle={
        <span className="mt-0.5 num text-[13px] font-semibold text-muted">
          {formatMoney(payment.amount)} {PER_PERIOD[payment.frequency]}
        </span>
      }
      onBack={dialog.fromSheet ? dialog.back : undefined}
      backLabel={`Back to ${payment.name}`}
      footer={
        <>
          <Link
            to={ROUTES.notes}
            onClick={dialog.close}
            className={buttonVariants({ variant: 'ghost' })}>
            Open in Notes
          </Link>
          <span className="flex-1" />
          <Button variant="accent" onClick={dialog.add}>
            <Plus size={16} aria-hidden="true" />
            Add a note
          </Button>
        </>
      }>
      {notes.length ? (
        <div className="flex flex-col gap-2.5">
          {notes.map(note => (
            <PaymentNoteCard
              key={note.id}
              note={note}
              today={dialog.today}
              onOpen={() => dialog.edit(note.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm font-medium text-muted">No notes on {payment.name} yet.</p>
      )}
    </Modal>
  );
};
