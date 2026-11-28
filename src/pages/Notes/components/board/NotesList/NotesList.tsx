import { NotesBoard } from '../../../hooks';
import { NoteCard } from '../../note';
import { noteGridClasses } from '../noteGridClasses';
import { NotesEmpty } from '../NotesEmpty';
import { NotesNoResults } from '../NotesNoResults';

/* The notes as a grid */
export const NotesList = ({ board }: { board: NotesBoard }) => {
  if (board.empty) return <NotesEmpty onAdd={board.openNew} />;
  return (
    <>
      <section aria-label="Notes" className={noteGridClasses}>
        {board.notes.map(note => (
          <NoteCard key={note.id} note={note} board={board} />
        ))}
      </section>
      {board.noResults ? <NotesNoResults query={board.query} onClear={board.clearQuery} /> : null}
    </>
  );
};
