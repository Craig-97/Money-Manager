import { NoteColor, NoteFieldsFragment, NoteRepeat, PaymentFrequency } from '~/graphql/generated';
import { addDays, formatShortDay, fromApiDate, parseIsoDate, toIsoDate } from '~/lib/dates';
import { nextOccurrence, Payment } from '~/lib/payments';

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
  // How often the date comes round. WITH_PAYMENT follows the linked payment's dates; the date
  // is then that payment's next one, filled in by followPayments.
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

// How often each repeat comes round, as the payment frequency with the same steps
const REPEAT_FREQUENCIES: Partial<Record<NoteRepeat, PaymentFrequency>> = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  BIANNUALLY: 'BIANNUALLY',
  YEARLY: 'ANNUALLY'
};

export const REPEAT_LABELS: Record<NoteRepeat, string> = {
  NONE: 'Just once',
  MONTHLY: 'Every month',
  QUARTERLY: 'Every 3 months',
  BIANNUALLY: 'Every 6 months',
  YEARLY: 'Every year',
  WITH_PAYMENT: 'With the payment'
};

/*
 * The note's date that matters now: its date, or for one that repeats, the first time it comes
 * round on or after `from`. A note that follows its payment already has the payment's next date.
 * Null for a note without a date.
 */
export const noteDateFrom = (note: Pick<Note, 'date' | 'repeat'>, from: Date) => {
  if (!note.date) return null;
  const frequency = REPEAT_FREQUENCIES[note.repeat];
  if (!frequency || note.date >= from) return note.date;
  return nextOccurrence({ firstPaymentDate: note.date, frequency, lastPaymentDate: null }, from);
};

// Days between one time and the next, at the shortest: a month can be 28 days
const GAP_DAYS: Record<PaymentFrequency, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 28,
  QUARTERLY: 89,
  BIANNUALLY: 181,
  ANNUALLY: 365
};

/*
 * The reminders a note can have, which have to come after the time before: a note following a
 * weekly payment can remind on the day or the day before, not a month before.
 */
export const remindChoices = ({
  repeat,
  paymentFrequency
}: {
  repeat: NoteRepeat;
  paymentFrequency?: PaymentFrequency | null;
}) => {
  const frequency = repeat === 'WITH_PAYMENT' ? paymentFrequency : REPEAT_FREQUENCIES[repeat];
  return frequency
    ? NOTE_REMIND_DAYS.filter(days => days < GAP_DAYS[frequency])
    : [...NOTE_REMIND_DAYS];
};

/* The reminder a note starts with: a week before, or the day before when that's too far ahead */
export const defaultRemind = (choices: readonly number[]) =>
  choices.includes(7) ? [7] : choices.includes(1) ? [1] : [0];

/* Notes that follow their payment take its next date; one whose payment has ended has none */
export const followPayments = (notes: readonly Note[], payments: readonly Payment[]): Note[] =>
  notes.map(note => {
    if (note.repeat !== 'WITH_PAYMENT') return note;
    const payment = payments.find(item => item.id === note.paymentId);
    return { ...note, date: payment?.dueDate ?? null };
  });

/* "every 6 months", or "before each Car Tax payment"; nothing for a note that doesn't repeat */
export const repeatText = (repeat: NoteRepeat, paymentName?: string) => {
  if (repeat === 'NONE') return '';
  if (repeat === 'WITH_PAYMENT')
    return paymentName ? `each time ${paymentName} is due` : 'with its payment';
  return REPEAT_LABELS[repeat].toLowerCase();
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

// Following a payment's dates, which needs a payment
const followsPayment = (draft: Pick<NoteDraft, 'repeat' | 'paymentId'>) =>
  draft.repeat === 'WITH_PAYMENT' && !!draft.paymentId;

/*
 * A draft as the API takes it. Without a date (or a payment to follow) there's nothing to remind
 * about or repeat; following a payment, the note's own date isn't used.
 */
export const noteInput = (draft: NoteDraft) => {
  const follows = followsPayment(draft);
  const dated = follows || !!draft.date;
  return {
    body: draft.body,
    color: draft.color,
    date: follows ? null : draft.date || null,
    remind: dated ? [...draft.remind].sort((a, b) => b - a) : [],
    repeat: follows
      ? ('WITH_PAYMENT' as const)
      : draft.date && draft.repeat !== 'WITH_PAYMENT'
        ? draft.repeat
        : ('NONE' as const),
    payment: draft.paymentId || null
  };
};

/* Whether two drafts save the same note */
export const sameDraft = (a: NoteDraft, b: NoteDraft) =>
  JSON.stringify(noteInput(a)) === JSON.stringify(noteInput(b));

const joinDates = (dates: string[]) =>
  dates.length <= 1 ? (dates[0] ?? '') : `${dates.slice(0, -1).join(', ')} and ${dates.at(-1)}`;

// What comes after the first reminders, for each repeat
const THEN: Record<NoteRepeat, string> = {
  NONE: '',
  MONTHLY: ', then on the same days each month',
  QUARTERLY: ', then every 3 months',
  BIANNUALLY: ', then every 6 months',
  YEARLY: ', then on the same days each year',
  WITH_PAYMENT: ', then before each payment after'
};

/*
 * Under the date: when the reminders will go off, e.g. "You'll get a reminder on Wed 7 Oct and
 * Sat 31 Oct, then on the same days each year." A note following its payment counts back from
 * the payment's next date.
 */
export const reminderHint = (
  draft: Pick<NoteDraft, 'date' | 'remind' | 'repeat' | 'paymentId'>,
  {
    today,
    format,
    paymentDue = null
  }: { today: Date; format: (date: Date) => string; paymentDue?: Date | null }
) => {
  const follows = followsPayment(draft);
  const date = follows ? paymentDue : parseIsoDate(draft.date);
  if (!date) return '';
  const repeat = follows ? 'WITH_PAYMENT' : draft.repeat;
  const repeats = repeat !== 'NONE';
  const next = noteDateFrom({ date, repeat }, today);
  if (!next) return '';
  if (!draft.remind.length) return 'No reminders. It still shows under Reminders, coming up.';
  const dates = [...draft.remind]
    .sort((a, b) => b - a)
    .map(days => addDays(next, -days))
    .filter(day => day >= today);
  if (!dates.length) return repeats ? '' : 'Its reminders have gone by.';
  const plural = dates.length === 1 ? 'a reminder' : 'reminders';
  return `You’ll get ${plural} on ${joinDates(dates.map(format))}${THEN[repeat]}.`;
};

/* Each recurring payment's notes, the most recently changed first */
export const notesByPayment = (notes: readonly Note[]) => {
  const byPayment = new Map<string, Note[]>();
  for (const note of notes) {
    if (!note.paymentId) continue;
    byPayment.set(note.paymentId, [...(byPayment.get(note.paymentId) ?? []), note]);
  }
  for (const list of byPayment.values()) list.sort((a, b) => b.updated - a.updated);
  return byPayment;
};

/*
 * The line under a note listed on its payment, where "Linked to" would only repeat the payment:
 * "Each payment · Reminds you 1 week before", "Tue 1 Dec · No reminder" or "No date"
 */
export const paymentNoteFoot = (note: Note, today: Date) => {
  const date = nextNoteDate(note, today);
  if (!date) return 'No date';
  if (date < today) return 'Its date has gone by';
  const when = note.repeat === 'WITH_PAYMENT' ? 'Each payment' : formatShortDay(date);
  return note.remind.length
    ? `${when} · Reminds you ${remindText(note.remind).toLowerCase()}`
    : `${when} · No reminder`;
};
