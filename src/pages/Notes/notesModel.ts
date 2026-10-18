import { daysBetween } from '~/lib/dates';
import { Note, nextNoteDate, remindText, repeatText } from '~/lib/notes';
import { formatShortDate } from '~/lib/payments';

export { NOTE_COLORS, noteColor, NOTE_MAX_LENGTH, charactersLeft } from '~/lib/notes';

export type NoteSort = 'date' | 'newest' | 'oldest' | 'updated' | 'updatedOldest';

export const NOTE_SORTS: { value: NoteSort; label: string }[] = [
  { value: 'date', label: 'Soonest date first' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Last updated' },
  { value: 'updatedOldest', label: 'Last updated (oldest)' }
];

export type { Note } from '~/lib/notes';
export { toNotes } from '~/lib/notes';

// Notes whose date is still to come, soonest first, then the rest newest first
const bySoonest = (today: Date) => (a: Note, b: Note) => {
  const x = nextNoteDate(a, today);
  const y = nextNoteDate(b, today);
  const ahead = (date: Date | null) => !!date && date >= today;
  if (ahead(x) && ahead(y)) return x!.getTime() - y!.getTime();
  if (ahead(x) !== ahead(y)) return ahead(x) ? -1 : 1;
  return b.created - a.created;
};

const SORTERS: Record<Exclude<NoteSort, 'date'>, (a: Note, b: Note) => number> = {
  newest: (a, b) => b.created - a.created,
  oldest: (a, b) => a.created - b.created,
  updated: (a, b) => b.updated - a.updated,
  updatedOldest: (a, b) => a.updated - b.updated
};

/* The notes containing the search text, in the chosen order */
export const findNotes = (
  notes: readonly Note[],
  { query, sort, today }: { query: string; sort: NoteSort; today: Date }
) => {
  const search = query.trim().toLowerCase();
  return notes
    .filter(note => !search || note.body.toLowerCase().includes(search))
    .toSorted(sort === 'date' ? bySoonest(today) : SORTERS[sort]);
};

// A date this close shows how far off it is too
const SOON_DAYS = 30;

/* The date on a dated note: "Sat 7 Nov", or "Thu 22 Oct · in 20 days" when it's close */
export const noteDateText = (note: Note, today: Date) => {
  const date = nextNoteDate(note, today);
  if (!date) return null;
  const days = daysBetween(today, date);
  const text = formatShortDate(date, today);
  if (days < 0 || days > SOON_DAYS) return text;
  if (days === 0) return `${text} · today`;
  return `${text} · ${days === 1 ? 'tomorrow' : `in ${days} days`}`;
};

/*
 * The line at the foot of a note: the payment it's about, when it reminds, or when it was written
 * for one without a date. "Linked to Broadband · £32.00 a month", "Reminds you 1 month before",
 * "No date · 9 Dec 2024".
 */
export const noteFoot = (
  note: Note,
  { today, paymentLabel }: { today: Date; paymentLabel: (id: string) => string | null }
) => {
  const linked = note.paymentId ? paymentLabel(note.paymentId) : null;
  if (linked) return `Linked to ${linked}`;
  const date = nextNoteDate(note, today);
  if (!date) return `No date · ${noteMeta(note)}`;
  if (date < today) return 'Its date has gone by';
  const every =
    note.repeat === 'NONE' || note.repeat === 'WITH_PAYMENT' ? '' : ` · ${repeatText(note.repeat)}`;
  return note.remind.length
    ? `Reminds you ${remindText(note.remind).toLowerCase()}${every}`
    : `No reminder${every}`;
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
