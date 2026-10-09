import { NotesBoard } from '../../../hooks';
import { NoteCard, NoteComposer } from '../../note';
import { noteGridClasses } from '../noteGridClasses';
import { NotesEmpty } from '../NotesEmpty';
import { NotesNoResults } from '../NotesNoResults';

/* The notes as a grid, with the composer first while it's open */
export const NotesList = ({ board }: { board: NotesBoard }) => {
  if (board.empty) return <NotesEmpty onAdd={board.openComposer} />;
  return (
    <>
      <section aria-label="Notes" className={noteGridClasses}>
        {board.composerOpen ? <NoteComposer board={board} /> : null}
        {board.notes.map(note => (
          <NoteCard key={note.id} note={note} board={board} />
        ))}
      </section>
      {board.noResults ? <NotesNoResults query={board.query} onClear={board.clearQuery} /> : null}
    </>
  );
};
