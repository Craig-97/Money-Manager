import { NoteColor } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';

export const NOTE_MAX_LENGTH = 200;
// The counter turns red with this many characters left
export const NOTE_LOW_LENGTH = 20;

export interface NoteColorStyle {
  value: NoteColor;
  label: string;
  // The card's tint and border
  card: string;
  dot: string;
  // The ring round the chosen swatch: the card colour, then the dot colour
  ring: string;
}

// Written out in full so Tailwind can find every class
export const NOTE_COLORS: readonly NoteColorStyle[] = [
  {
    value: 'BLUE',
    label: 'Blue',
    card: 'border-note-blue-line bg-note-blue',
    dot: 'bg-note-blue-dot',
    ring: 'shadow-[0_0_0_3px_var(--n-blue),0_0_0_5px_var(--n-blue-dot)]'
  },
  {
    value: 'GREEN',
    label: 'Green',
    card: 'border-note-green-line bg-note-green',
    dot: 'bg-note-green-dot',
    ring: 'shadow-[0_0_0_3px_var(--n-green),0_0_0_5px_var(--n-green-dot)]'
  },
  {
    value: 'AMBER',
    label: 'Amber',
    card: 'border-note-amber-line bg-note-amber',
    dot: 'bg-note-amber-dot',
    ring: 'shadow-[0_0_0_3px_var(--n-amber),0_0_0_5px_var(--n-amber-dot)]'
  },
  {
    value: 'ROSE',
    label: 'Rose',
    card: 'border-note-rose-line bg-note-rose',
    dot: 'bg-note-rose-dot',
    ring: 'shadow-[0_0_0_3px_var(--n-rose),0_0_0_5px_var(--n-rose-dot)]'
  },
  {
    value: 'VIOLET',
    label: 'Violet',
    card: 'border-note-violet-line bg-note-violet',
    dot: 'bg-note-violet-dot',
    ring: 'shadow-[0_0_0_3px_var(--n-violet),0_0_0_5px_var(--n-violet-dot)]'
  }
];

export const noteColor = (value: NoteColor) =>
  NOTE_COLORS.find(color => color.value === value) ?? NOTE_COLORS[0];

export type NoteSort = 'newest' | 'oldest' | 'updated' | 'updatedOldest';

export const NOTE_SORTS: { value: NoteSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Last updated' },
  { value: 'updatedOldest', label: 'Last updated (oldest)' }
];

export interface Note {
  id: string;
  body: string;
  color: NoteColor;
  // Milliseconds since 1970
  created: number;
  updated: number;
}

// The API sends timestamps as epoch milliseconds in a string; ISO strings are read too
const toTime = (value: string) => {
  const ms = Number(value);
  return Number.isNaN(ms) ? Date.parse(value) || 0 : ms;
};

export const toNotes = (notes: Account['notes']): Note[] =>
  (notes ?? []).flatMap(note =>
    note
      ? [
          {
            id: note.id,
            body: note.body,
            color: note.color,
            created: toTime(note.createdAt),
            updated: toTime(note.updatedAt)
          }
        ]
      : []
  );

const SORTERS: Record<NoteSort, (a: Note, b: Note) => number> = {
  newest: (a, b) => b.created - a.created,
  oldest: (a, b) => a.created - b.created,
  updated: (a, b) => b.updated - a.updated,
  updatedOldest: (a, b) => a.updated - b.updated
};

/* The notes containing the search text, in the chosen order */
export const findNotes = (notes: readonly Note[], query: string, sort: NoteSort) => {
  const search = query.trim().toLowerCase();
  return notes
    .filter(note => !search || note.body.toLowerCase().includes(search))
    .toSorted(SORTERS[sort]);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Saving a new note can stamp its two times a moment apart
const EDITED_AFTER_MS = 1000;

/* "9 Dec 2024", with "· Edited" once it's been changed */
export const noteMeta = (note: Note) => {
  const date = new Date(note.created);
  const day = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  return note.updated - note.created > EDITED_AFTER_MS ? `${day} · Edited` : day;
};

/* The start of the first line, to tell notes apart in button names */
export const notePreview = (body: string) => body.split('\n')[0].slice(0, 30);

export const countNotes = (count: number) => `${count} ${count === 1 ? 'note' : 'notes'}`;

export const charactersLeft = (text: string) => {
  const left = NOTE_MAX_LENGTH - text.length;
  return {
    left,
    label: `${left} ${left === 1 ? 'character' : 'characters'} remaining`,
    low: left <= NOTE_LOW_LENGTH
  };
};
