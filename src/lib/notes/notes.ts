import { NoteColor, NoteFieldsFragment, NoteRepeat } from '~/graphql/generated';
import { addDays, fromApiDate, parseIsoDate, toIsoDate } from '~/lib/dates';

// The days before a note's date it can remind: on the day, the day before, a week, two weeks, a month
export const NOTE_REMIND_DAYS = [0, 1, 7, 14, 30] as const;

// A new date reminds a week before, until other reminders are picked
export const DEFAULT_NOTE_REMIND = [7];

export interface Note {
  id: string;
  body: string;
  color: NoteColor;
  // Milliseconds since 1970
  created: number;
  updated: number;
  // A day the note is about, e.g. an MOT
  date: Date | null;
  // Days before the date to remind, furthest first
  remind: number[];
  // Whether the date comes round every year
  repeat: NoteRepeat;
  // The recurring payment it's about
  paymentId: string | null;
}

// The API sends timestamps as epoch milliseconds in a string; ISO strings are read too
const toTime = (value: string) => {
  const ms = Number(value);
  return Number.isNaN(ms) ? Date.parse(value) || 0 : ms;
};

export const toNote = (note: NoteFieldsFragment): Note => ({
  id: note.id,
  body: note.body,
  color: note.color,
  created: toTime(note.createdAt),
  updated: toTime(note.updatedAt),
  date: fromApiDate(note.date),
  remind: [...note.remind].sort((a, b) => b - a),
  repeat: note.repeat,
  paymentId: note.payment
});

export const toNotes = (notes: readonly (NoteFieldsFragment | null)[] | null | undefined): Note[] =>
  (notes ?? []).flatMap(note => (note ? [toNote(note)] : []));

/* The same day some years on, moving 29 Feb to 28 Feb */
const yearsOn = (date: Date, years: number) => {
  const next = new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
  return next.getMonth() === date.getMonth()
    ? next
    : new Date(date.getFullYear() + years, date.getMonth() + 1, 0);
};

/*
 * The note's date that matters now: its date, or for one that repeats yearly, the first time it
 * comes round on or after `from`. Null for a note without a date.
 */
export const noteDateFrom = (note: Pick<Note, 'date' | 'repeat'>, from: Date) => {
  if (!note.date) return null;
  if (note.repeat !== 'YEARLY' || note.date >= from) return note.date;
  let years = Math.max(1, from.getFullYear() - note.date.getFullYear());
  while (yearsOn(note.date, years) < from) years += 1;
  // A year earlier may still be on or after `from`, when the date is late in the year
  while (years > 1 && yearsOn(note.date, years - 1) >= from) years -= 1;
  return yearsOn(note.date, years);
};

/* The note's next date, today included */
export const nextNoteDate = (note: Pick<Note, 'date' | 'repeat'>, today: Date) =>
  noteDateFrom(note, today);

// "1 month", "2 weeks", "1 day": how long before, without the "before"
const spanText = (days: number) => {
  if (days === 30) return '1 month';
  if (days % 7 === 0) return `${days / 7} ${days === 7 ? 'week' : 'weeks'}`;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

const joinAnd = (parts: string[]) =>
  parts.length <= 1 ? (parts[0] ?? '') : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;

/* "1 month and 1 week before", "On the day", "2 weeks before and on the day" */
export const remindText = (remind: readonly number[]) => {
  const before = [...remind].filter(days => days > 0).sort((a, b) => b - a);
  const onTheDay = remind.includes(0);
  if (!before.length) return onTheDay ? 'On the day' : '';
  const text = `${joinAnd(before.map(spanText))} before`;
  return onTheDay ? `${text} and on the day` : text;
};

/* The days the note reminds on, soonest first, for its next date */
export const remindDates = (note: Pick<Note, 'date' | 'repeat' | 'remind'>, today: Date) => {
  const date = nextNoteDate(note, today);
  if (!date) return [];
  return note.remind.map(days => addDays(date, -days)).sort((a, b) => a.getTime() - b.getTime());
};

/* The start of the note's first line, short enough for a heading */
export const noteHeading = (body: string, length = 48) => {
  const line = body.trim().split('\n')[0];
  return line.length > length ? `${line.slice(0, length - 1).trimEnd()}…` : line;
};

// What the note dialog edits: the date as 'YYYY-MM-DD' and the payment as its id, '' for none
export interface NoteDraft {
  body: string;
  color: NoteColor;
  date: string;
  remind: number[];
  repeat: NoteRepeat;
  paymentId: string;
}

export const BLANK_DRAFT: NoteDraft = {
  body: '',
  color: 'BLUE',
  date: '',
  remind: [],
  repeat: 'NONE',
  paymentId: ''
};

export const toDraft = (note: Note): NoteDraft => ({
  body: note.body,
  color: note.color,
  date: note.date ? toIsoDate(note.date) : '',
  remind: note.remind,
  repeat: note.repeat,
  paymentId: note.paymentId ?? ''
});

/* A draft as the API takes it. Without a date there's nothing to remind about or repeat. */
export const noteInput = (draft: NoteDraft) => ({
  body: draft.body,
  color: draft.color,
  date: draft.date || null,
  remind: draft.date ? [...draft.remind].sort((a, b) => b - a) : [],
  repeat: draft.date ? draft.repeat : ('NONE' as const),
  payment: draft.paymentId || null
});

/* Whether two drafts save the same note */
export const sameDraft = (a: NoteDraft, b: NoteDraft) =>
  JSON.stringify(noteInput(a)) === JSON.stringify(noteInput(b));

const joinDates = (dates: string[]) =>
  dates.length <= 1 ? (dates[0] ?? '') : `${dates.slice(0, -1).join(', ')} and ${dates.at(-1)}`;

/*
 * Under the date: when the reminders will go off, e.g. "You'll get a reminder on Wed 7 Oct and
 * Sat 31 Oct, then on the same days each year."
 */
export const reminderHint = (
  draft: Pick<NoteDraft, 'date' | 'remind' | 'repeat'>,
  { today, format }: { today: Date; format: (date: Date) => string }
) => {
  const date = parseIsoDate(draft.date);
  if (!date) return '';
  const yearly = draft.repeat === 'YEARLY';
  const next = noteDateFrom({ date, repeat: draft.repeat }, today);
  if (!next) return '';
  if (!draft.remind.length) return 'No reminders. It still shows under Reminders, coming up.';
  const dates = [...draft.remind]
    .sort((a, b) => b - a)
    .map(days => addDays(next, -days))
    .filter(day => day >= today);
  if (!dates.length) return yearly ? '' : 'Its reminders have gone by.';
  const plural = dates.length === 1 ? 'a reminder' : 'reminders';
  return `You’ll get ${plural} on ${joinDates(dates.map(format))}${yearly ? ', then on the same days each year' : ''}.`;
};
