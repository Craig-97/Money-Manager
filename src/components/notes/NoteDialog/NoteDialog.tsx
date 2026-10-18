import { Trash } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { Account, useAccount } from '~/hooks/useAccount';
import { useNoteActions } from '~/hooks/useNoteActions';
import { usePayCycle } from '~/hooks/usePayCycle';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { NOTE_MAX_LENGTH, noteColor, toNotes } from '~/lib/notes';
import { PER_PERIOD, toPayments } from '~/lib/payments';
import { ColorSwatches, NoteDateFields, NotePaymentOption } from './components';
import { useNoteDialog } from './useNoteDialog';

/*
 * The recurring payments a note can be about, by name: "Car insurance · £612.00 a year", with
 * each one's next date and how often, for a note that follows it
 */
const paymentOptions = (account: Account, today: Date): NotePaymentOption[] =>
  toPayments(account, today)
    .flatMap(payment => (payment.kind === 'recurring' ? [payment] : []))
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map(payment => ({
      value: payment.id,
      label: `${payment.name} · ${formatMoney(payment.amount)} ${PER_PERIOD[payment.frequency]}`,
      name: payment.name,
      due: payment.dueDate,
      frequency: payment.frequency
    }));

/*
 * Writing a note or changing one: a dialog on desktop, a bottom sheet on mobile. It's opened from
 * the notes page, the mobile nav's add button and reminders, so it lives with the app's layout.
 * The text box takes the note's colour. Ctrl/⌘+Enter saves; Escape closes, as any dialog.
 */
export const NoteDialog = () => {
  const { account } = useAccount();
  const { today } = usePayCycle(account?.payday);
  const actions = useNoteActions(account?.id ?? '');
  const dialog = useNoteDialog({ notes: toNotes(account?.notes), actions });
  const { draft, editing } = dialog;

  if (!account) return null;

  return (
    <Modal
      open={dialog.open}
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={editing ? 'Edit note' : 'New note'}
      initialFocusId="note-text"
      footer={
        <>
          {editing ? (
            <Button variant="dangerGhost" onClick={dialog.remove} className="max-md:-ml-2">
              <Trash size={16} aria-hidden="true" />
              Delete
            </Button>
          ) : null}
          <span className="flex-1" />
          <Button variant="ghost" onClick={dialog.close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={dialog.save}
            disabled={draft.empty}
            loading={draft.saving}
            className="max-md:h-[52px]">
            Save note
          </Button>
        </>
      }>
      <div>
        <label htmlFor="note-text" className="sr-only">
          Note
        </label>
        <textarea
          id="note-text"
          rows={5}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="Start typing your note…"
          value={draft.body}
          onChange={event => draft.setBody(event.target.value)}
          onFocus={event => {
            // The cursor goes at the end, ready to carry on writing
            const end = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(end, end);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              dialog.save();
            }
          }}
          aria-describedby="note-text-count"
          className={cn(
            'block min-h-[140px] w-full resize-y rounded-[20px] border p-4 text-base leading-[1.55] font-medium text-text outline-none placeholder:text-faint focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]',
            noteColor(draft.color).card
          )}
        />
        <p
          id="note-text-count"
          aria-label={draft.count.label}
          className={cn(
            'mt-1.5 mr-1 text-right num text-xs font-semibold',
            draft.count.low ? 'text-expense' : 'text-muted'
          )}>
          {draft.count.left}
        </p>
      </div>
      <div>
        <p id="note-colour" className="mb-1 text-[13px] font-bold text-muted">
          Colour
        </p>
        <div className="-ml-2.5">
          <ColorSwatches draft={draft} labelledBy="note-colour" />
        </div>
      </div>
      <NoteDateFields draft={draft} payments={paymentOptions(account, today)} today={today} />
    </Modal>
  );
};
