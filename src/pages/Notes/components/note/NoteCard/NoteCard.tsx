import { Bell, Pencil, Trash2 } from 'lucide-react';
import { cn } from '~/lib/cn';
import { NotesBoard } from '../../../hooks';
import { Note, noteColor, noteDateText, noteFoot, notePreview } from '../../../notesModel';

const noteButton =
  'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-text';

/*
 * A note on the board: its date at the top when it has one, then the text, and at the foot the
 * payment it's about, when it reminds, or when it was written. Its pencil opens it to change.
 */
export const NoteCard = ({ note, board }: { note: Note; board: NotesBoard }) => {
  const color = noteColor(note.color);
  const preview = notePreview(note.body);
  const date = noteDateText(note, board.today);

  return (
    <article
      className={cn(
        'flex min-h-[200px] flex-col gap-3.5 rounded-[22px] border p-[18px] md:h-[212px] md:min-h-0 md:gap-4 md:rounded-3xl md:p-[22px] md:transition-[transform,box-shadow] md:duration-200 md:hover:-translate-y-0.5 md:hover:shadow-[0_22px_44px_-26px_var(--shadow)]',
        color.card
      )}>
      {date ? (
        <p className="-mb-1 inline-flex h-7 items-center gap-1.5 self-start rounded-full bg-[color-mix(in_srgb,var(--bg)_55%,transparent)] px-2.5 text-xs font-bold md:-mb-2">
          <Bell size={13} strokeWidth={2.25} aria-hidden="true" className="text-accent-text" />
          <span className="sr-only">Date: </span>
          <span className="num">{date}</span>
        </p>
      ) : null}
      <p className="min-h-0 grow overflow-hidden text-base leading-[1.55] font-medium wrap-anywhere whitespace-pre-line">
        {note.body}
      </p>
      <div className="-mr-2.5 -mb-2.5 flex items-center justify-between gap-2 max-md:-mt-1">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-muted">
          <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', color.dot)} />
          <span className="truncate num">
            {noteFoot(note, { today: board.today, paymentLabel: board.paymentLabel })}
          </span>
        </span>
        <span className="flex">
          <button
            type="button"
            aria-label={`Edit note: ${preview}`}
            aria-haspopup="dialog"
            onClick={() => board.openEdit(note.id)}
            className={noteButton}>
            <Pencil size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete note: ${preview}`}
            onClick={() => {
              void board.actions.remove(note);
            }}
            className={cn(noteButton, 'hover:text-expense')}>
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </span>
      </div>
    </article>
  );
};
