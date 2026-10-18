import { ChevronRight, FileText, Repeat } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from '~/components/ui/Modal';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { useReminderChooserStore } from '~/state/reminderChooser';

const CHOICES = [
  {
    id: 'note',
    title: 'Note with a date',
    text: 'Get reminded before it, like an MOT',
    Icon: FileText
  },
  {
    id: 'recurring',
    title: 'Recurring payment',
    text: 'Bills and subscriptions that repeat',
    Icon: Repeat
  }
] as const;

/* Adding from Reminders: a note with a date, or a recurring payment */
export const AddChooser = () => {
  const { open, close } = useReminderChooserStore(
    useShallow(s => ({ open: s.open, close: s.close }))
  );
  const openNote = useNoteDialogStore(s => s.openNew);
  const openPayment = usePaymentDialogStore(s => s.openAdd);

  const choose = (id: (typeof CHOICES)[number]['id']) => {
    close();
    if (id === 'note') openNote();
    else openPayment('recurring');
  };

  return (
    <Modal
      open={open}
      onOpenChange={next => (next ? undefined : close())}
      title="What are you adding?">
      <div className="flex flex-col gap-2.5">
        {CHOICES.map(({ id, title, text, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => choose(id)}
            className="flex min-h-[78px] w-full cursor-pointer items-center gap-3.5 rounded-[22px] border border-border bg-surface-2 px-4 text-left transition-colors hover:border-border-strong hover:bg-hover">
            <span
              aria-hidden="true"
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-on-accent">
              <Icon size={21} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px] font-bold">{title}</span>
              <span className="text-[13px] font-medium text-muted">{text}</span>
            </span>
            <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
          </button>
        ))}
      </div>
    </Modal>
  );
};
