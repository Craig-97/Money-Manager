import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '~/lib/cn';
import { NotesBoard } from '../../../hooks';
import { Note, noteColor, noteMeta, notePreview } from '../../../notesModel';
import { NoteEditor } from '../NoteEditor';

const noteButton =
  'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-text';

/* A note on the board, or the form to change it while it's being edited */
export const NoteCard = ({ note, board }: { note: Note; board: NotesBoard }) => {
  if (board.editingId === note.id) return <NoteEditor note={note} board={board} />;

  const color = noteColor(note.color);
  const preview = notePreview(note.body);

  return (
    <article
      className={cn(
        'flex min-h-[200px] flex-col gap-3.5 rounded-[22px] border p-[18px] md:h-[190px] md:min-h-0 md:gap-4 md:rounded-3xl md:p-[22px] md:transition-[transform,box-shadow] md:duration-200 md:hover:-translate-y-0.5 md:hover:shadow-[0_22px_44px_-26px_var(--shadow)]',
        color.card
      )}>
      <p className="min-h-0 grow overflow-hidden text-base leading-[1.55] font-medium wrap-anywhere whitespace-pre-line">
        {note.body}
      </p>
      <div className="-mr-2.5 -mb-2.5 flex items-center justify-between gap-2 max-md:-mt-1">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
          <span aria-hidden="true" className={cn('size-2 rounded-full', color.dot)} />
          <span className="num">{noteMeta(note)}</span>
        </span>
        <span className="flex">
          <button
            type="button"
            aria-label={`Edit note: ${preview}`}
            onClick={() => board.startEditing(note.id)}
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
