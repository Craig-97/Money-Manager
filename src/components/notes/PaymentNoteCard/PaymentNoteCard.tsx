import { cn } from '~/lib/cn';
import { Note, noteColor, noteHeading, paymentNoteFoot } from '~/lib/notes';

interface PaymentNoteCardProps {
  note: Note;
  today: Date;
  onOpen: () => void;
}

/* A note in its colour, listed on the payment it's about. Clicking it opens it to change. */
export const PaymentNoteCard = ({ note, today, onOpen }: PaymentNoteCardProps) => {
  const color = noteColor(note.color);
  return (
    <button
      type="button"
      aria-label={`Edit note: ${noteHeading(note.body)}`}
      aria-haspopup="dialog"
      onClick={onOpen}
      className={cn(
        'flex w-full cursor-pointer flex-col gap-2 rounded-[18px] border px-4 py-3.5 text-left transition-[filter] hover:brightness-[1.04]',
        color.card
      )}>
      <span className="text-sm leading-[1.45] font-semibold wrap-anywhere whitespace-pre-line text-text">
        {note.body}
      </span>
      <span className="flex items-center gap-2 text-xs font-semibold text-muted">
        <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', color.dot)} />
        <span className="num">{paymentNoteFoot(note, today)}</span>
      </span>
    </button>
  );
};
