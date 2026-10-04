import { ArrowDownWideNarrow, Plus } from 'lucide-react';
import { SearchInput } from '~/components/form/SearchInput';
import { Select } from '~/components/form/Select';
import { Button } from '~/components/ui/Button';
import { NotesBoard } from '../hooks';
import { countNotes, NOTE_SORTS } from '../notesModel';

/* Search, sort and Add note. On mobile the search takes its own row. */
export const NotesToolbar = ({ board }: { board: NotesBoard }) => (
  <>
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <SearchInput
        aria-label="Search notes"
        placeholder="Search notes"
        autoComplete="off"
        value={board.query}
        onChange={event => board.setQuery(event.target.value)}
        onClear={board.clearQuery}
        boxClassName="basis-full md:flex-[1_1_320px] md:basis-auto"
      />
      <div className="relative flex-auto md:flex-none">
        <ArrowDownWideNarrow
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 z-1 -translate-y-1/2 text-muted"
        />
        <Select
          variant="pill"
          aria-label="Sort notes"
          value={board.sort}
          onValueChange={board.setSort}
          options={NOTE_SORTS}
          className="h-12 w-full border-border pl-11 text-sm md:h-[52px] md:w-auto md:pr-[18px]"
        />
      </div>
      <Button
        variant="accent"
        onClick={board.openComposer}
        className="h-12 flex-auto px-6 font-bold md:h-[52px] md:flex-none">
        <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
        Add note
      </Button>
    </div>
    {board.searching ? (
      <p
        aria-live="polite"
        className="-mt-1 px-1 text-[13px] font-medium text-muted md:-mt-3 md:px-0 md:text-sm">
        <span className="num font-bold text-text">{countNotes(board.notes.length)}</span> matching “
        {board.query.trim()}”
      </p>
    ) : null}
  </>
);
