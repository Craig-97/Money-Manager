import { FileText } from 'lucide-react';
import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { Note, noteHeading } from '~/lib/notes';
import { Payment } from '~/lib/payments';
import { usePaymentNotesStore } from '~/state/paymentNotes';
import { tagClasses } from '../tagClasses';

interface NoteChipProps {
  payment: Payment;
  notes: readonly Note[];
  // A preview on hover and focus, and a click to open them; left out where the row is the button
  hint?: boolean;
}

const chipClasses = cn(tagClasses, 'h-[22px] shrink-0 gap-1 px-2 num text-[11px]');

/*
 * The notes on a payment, as a note icon and a count by its name. Hovering shows the start of
 * each, as the ×2 tag shows its dates, and clicking lists them. Nothing for a payment without notes.
 */
export const NoteChip = ({ payment, notes, hint = true }: NoteChipProps) => {
  const openNotes = usePaymentNotesStore(s => s.openFor);
  if (!notes.length) return null;
  const label = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} on ${payment.name}`;
  const icon = (
    <FileText size={12} strokeWidth={2.25} className="text-note-amber-dot" aria-hidden="true" />
  );

  if (!hint) {
    return (
      <span aria-hidden="true" className={chipClasses}>
        {icon}
        {notes.length}
      </span>
    );
  }

  return (
    <Tooltip
      side="top"
      tone="card"
      label={
        <>
          <span className="font-bold">{label}</span>
          {notes.map(note => (
            <span key={note.id} className="text-muted">
              {noteHeading(note.body, 46)}
            </span>
          ))}
        </>
      }>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => openNotes(payment.id)}
        className={cn(
          chipClasses,
          // The tag stays small; the space round it still takes the tap
          'relative cursor-pointer transition-colors after:absolute after:-inset-x-1 after:-inset-y-[11px] hover:border-border-strong hover:text-text'
        )}>
        {icon}
        {notes.length}
      </button>
    </Tooltip>
  );
};
