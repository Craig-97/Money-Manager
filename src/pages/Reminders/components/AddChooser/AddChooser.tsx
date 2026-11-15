import { FileText, Repeat } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { ChoiceList, Modal } from '~/components/ui';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { useReminderChooserStore } from '~/state/reminderChooser';

const CHOICES = [
  {
    key: 'note' as const,
    Icon: FileText,
    title: 'Note with a date',
    body: 'Get reminded before it, like an MOT'
  },
  {
    key: 'recurring' as const,
    Icon: Repeat,
    title: 'Recurring payment',
    body: 'Bills and subscriptions that repeat'
  }
];

/* Adding from Reminders: a note with a date, or a recurring payment */
export const AddChooser = () => {
  const { open, close } = useReminderChooserStore(
    useShallow(s => ({ open: s.open, close: s.close }))
  );
  const openNote = useNoteDialogStore(s => s.openNew);
  const openPayment = usePaymentDialogStore(s => s.openAdd);

  return (
    <Modal
      open={open}
      onOpenChange={next => (next ? undefined : close())}
      title="What are you adding?">
      <ChoiceList
        choices={CHOICES}
        onChoose={key => {
          close();
          if (key === 'note') openNote();
          else openPayment('recurring');
        }}
      />
    </Modal>
  );
};
