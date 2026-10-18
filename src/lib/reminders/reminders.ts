import { addDays, daysBetween, fromApiDate, toIsoDate } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { Note, noteDateFrom, noteHeading, remindText } from '~/lib/notes';
import { PayCycle } from '~/lib/payday';
import {
  formatShortDate,
  Payment,
  RecurringPayment,
  Renewal,
  renewalHeading,
  renewalOf,
  ReminderSettings,
  timingText
} from '~/lib/payments';

/*
 * Reminders, worked out from the payments, notes and payday each time they're needed. Only what
 * the user did with each one is kept, on the API, by a key that names what it's about and the date
 * it's for, so the next time round is a new reminder.
 *
 * New holds the ones that have gone off and haven't been cleared or put away until later. Coming up
 * is what's ahead: each payment's next date, renewals, dated notes and the next payday.
 */

export type ReminderKind = 'due' | 'overdue' | 'renewal' | 'renewed' | 'note' | 'payday';

// The Coming up filters; paydays count as payments
export type ReminderFilter = 'all' | 'payments' | 'renewals' | 'notes';

export interface Reminder {
  key: string;
  kind: ReminderKind;
  // The day it's about: a due date, a renewal, a note's date or a payday
  date: Date;
  // The day it goes off; null when its reminder is off
  firesOn: Date | null;
  // "1 day before", "On the day", "Off"
  timing: string;
  // For New: "Energy is due tomorrow"
  title: string;
  // For Coming up: "Energy is due"
  name: string;
  // What it's about, under the title
  body: string;
  // Signed, as on the dashboard; null when there's no money in it
  amount: number | null;
  payment: RecurringPayment | null;
  note: Note | null;
  // A note about the payment, for a renewal to open
  paymentNote: Note | null;
  // Seen, so it doesn't count towards the bell's number
  read: boolean;
  // A payday whose new cycle hasn't been started on the dashboard yet
  awaitingStart?: boolean;
}

export interface ReminderState {
  read: boolean;
  cleared: boolean;
  // Put away until this day
  snoozedUntil: Date | null;
}

export type ReminderStates = ReadonlyMap<string, ReminderState>;

interface StoredState {
  key: string;
  read: boolean;
  cleared: boolean;
  snoozedUntil: string | null;
}

export const toReminderStates = (
  states: readonly StoredState[] | null | undefined
): ReminderStates =>
  new Map(
    (states ?? []).map(state => [
      state.key,
      { read: state.read, cleared: state.cleared, snoozedUntil: fromApiDate(state.snoozedUntil) }
    ])
  );

export interface ReminderSources {
  payments: Payment[];
  notes: Note[];
  settings: ReminderSettings;
  cycle: PayCycle;
  // The payday the current cycle was started on
  cycleStartedOn: Date | null;
  // What comes in on payday, when that's known
  payAmount: number | null;
  states: ReminderStates;
  today: Date;
}

// A payday's reminder stays in New for a week
const PAYDAY_DAYS = 7;
// A note's reminder stays in New this long after its date
const NOTE_AFTER_DAYS = 3;
// How long Later puts a reminder away: payments come back tomorrow, the rest in a few days
const LATER_DAYS: Record<ReminderKind, number> = {
  due: 1,
  overdue: 1,
  renewal: 3,
  renewed: 3,
  note: 3,
  payday: 1
};

const keyOf = (kind: string, ...parts: (string | Date)[]) =>
  [kind, ...parts.map(part => (part instanceof Date ? toIsoDate(part) : part))].join(':');

/* A renewal's key, shared by the dashboard's alert and the reminder */
export const renewalKey = (payment: Pick<Payment, 'id'>, renewal: Renewal) =>
  keyOf(renewal.passed ? 'renewed' : 'renewal', payment.id, renewal.date);

/* An overdue payment's key, shared by the dashboard's alert and the reminder */
export const overdueKey = (payment: Pick<Payment, 'id'>, due: Date) =>
  keyOf('overdue', payment.id, due);

/*
 * "today", "tomorrow", "in 14 days", "in 17 weeks", "in 8 months": counted the same way as the
 * dashboard's renewal alerts and the renewals list
 */
export const inTime = (days: number) => {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 60) return `in ${days} days`;
  if (days < 182) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30.44)} months`;
};

// "is due tomorrow", or "comes in tomorrow" for money in
const dueText = (payment: Payment, days: number) =>
  `${payment.type === 'INCOME' ? 'comes in' : 'is due'} ${inTime(days)}`;

const paymentEvents = ({ payments, notes, today }: ReminderSources) =>
  payments.flatMap((payment): Omit<Reminder, 'read'>[] => {
    if (payment.kind !== 'recurring' || !payment.dueDate) return [];
    const due = payment.dueDate;
    const base = {
      date: due,
      amount: payment.signedAmount,
      payment,
      note: null,
      paymentNote: notes.find(note => note.paymentId === payment.id) ?? null
    };
    const money = formatMoney(payment.amount);

    if (due < today) {
      return [
        {
          ...base,
          key: overdueKey(payment, due),
          kind: 'overdue',
          firesOn: addDays(due, 1),
          timing: 'Overdue',
          title: `${payment.name} · ${money} was due ${formatShortDate(due, today)}`,
          name: `${payment.name} is overdue`,
          body: 'Still unpaid. Mark it paid or skip it to clear it.'
        }
      ];
    }

    const days = payment.dueReminderDays;
    return [
      {
        ...base,
        key: keyOf('due', payment.id, due),
        kind: 'due',
        firesOn: days === null ? null : addDays(due, -days),
        timing: timingText(days),
        title: `${payment.name} ${dueText(payment, daysBetween(today, due))}`,
        name: `${payment.name} ${payment.type === 'INCOME' ? 'comes in' : 'is due'}`,
        body: `${formatShortDate(due, today)} · ${money}`
      }
    ];
  });

const renewalEvents = ({ payments, notes, today }: ReminderSources) =>
  payments.flatMap((payment): Omit<Reminder, 'read'>[] => {
    if (payment.kind !== 'recurring') return [];
    const renewal = renewalOf(payment, today);
    if (!renewal) return [];
    const paymentNote = notes.find(note => note.paymentId === payment.id) ?? null;
    const base = {
      key: renewalKey(payment, renewal),
      date: renewal.date,
      amount: payment.signedAmount,
      payment,
      note: null,
      paymentNote
    };
    const noteText = paymentNote ? ' · you have a note' : '';

    if (renewal.passed) {
      return [
        {
          ...base,
          kind: 'renewed',
          firesOn: renewal.date,
          timing: 'Renewed',
          title: renewalHeading(payment, { renewal, today }),
          name: `${payment.name} has renewed`,
          body: `${formatShortDate(renewal.date, today)} · check the price and set the next date${noteText}`
        }
      ];
    }

    const days = payment.renewalReminderDays || null;
    return [
      {
        ...base,
        kind: 'renewal',
        firesOn: days === null ? null : addDays(renewal.date, -days),
        timing: timingText(days),
        // Word for word the dashboard's alert
        title: renewalHeading(payment, { renewal, today }),
        name: `${payment.name} renews`,
        body: `${formatShortDate(renewal.date, today)} · ${formatMoney(payment.amount)} · check the price${noteText}`
      }
    ];
  });

const noteEvents = ({ notes, today }: ReminderSources) =>
  notes.flatMap((note): Omit<Reminder, 'read'>[] => {
    // Still the one just gone by for a few days, so its reminder can be seen
    const date = noteDateFrom(note, addDays(today, -NOTE_AFTER_DAYS));
    if (!date) return [];
    const days = daysBetween(today, date);
    // The latest of its reminders to have gone off, or its first one still to come
    const fired = note.remind.filter(before => addDays(date, -before) <= today);
    const before = fired.length ? Math.min(...fired) : note.remind[0];
    const firesOn = before === undefined ? null : addDays(date, -before);
    const heading = noteHeading(note.body);
    return [
      {
        key: keyOf('note', note.id, date, String(before ?? 'none')),
        kind: 'note',
        date,
        firesOn,
        timing: note.remind.length ? remindText(note.remind) : 'Off',
        title:
          days < 0
            ? `${heading} was ${formatShortDate(date, today)}`
            : `${heading} · ${inTime(days)}`,
        name: heading,
        body: `${formatShortDate(date, today)}${note.repeat === 'YEARLY' ? ' · every year' : ''} · from your note`,
        amount: null,
        payment: null,
        note,
        paymentNote: null
      }
    ];
  });

const paydayEvents = ({ settings, cycle, cycleStartedOn, payAmount, today }: ReminderSources) => {
  const timing = settings.payday ? 'On the day' : 'Off';
  const amount = payAmount;
  const events: Omit<Reminder, 'read'>[] = [
    {
      key: keyOf('payday', cycle.end),
      kind: 'payday',
      date: cycle.end,
      firesOn: settings.payday ? cycle.end : null,
      timing,
      title: 'It’s payday',
      name: 'Payday',
      body: formatShortDate(cycle.end, today),
      amount,
      payment: null,
      note: null,
      paymentNote: null
    }
  ];
  // The payday just gone, for a few days after
  if (daysBetween(cycle.start, today) <= PAYDAY_DAYS) {
    const started = !!cycleStartedOn && cycleStartedOn >= cycle.start;
    events.push({
      key: keyOf('payday', cycle.start),
      kind: 'payday',
      date: cycle.start,
      firesOn: settings.payday ? cycle.start : null,
      timing,
      title: cycle.isPayday
        ? 'It’s payday'
        : `You were paid on ${formatShortDate(cycle.start, today)}`,
      name: 'Payday',
      body: started
        ? 'Balance confirmed and the new cycle started'
        : 'Confirm your balance to start the new cycle',
      awaitingStart: !started,
      amount,
      payment: null,
      note: null,
      paymentNote: null
    });
  }
  return events;
};

const isPutAway = (state: ReminderState | undefined, today: Date) =>
  !!state?.snoozedUntil && state.snoozedUntil > today;

/* Whether a reminder can be cleared: an overdue payment stays until it's paid or skipped */
export const canClear = (reminder: Pick<Reminder, 'kind'>) => reminder.kind !== 'overdue';

/* Whether it's gone off and is still waiting in New */
const isNew = (reminder: Omit<Reminder, 'read'>, sources: ReminderSources) => {
  const { today, states } = sources;
  if (!reminder.firesOn || reminder.firesOn > today) return false;
  if (reminder.kind === 'note' && daysBetween(reminder.date, today) > NOTE_AFTER_DAYS) return false;
  if (reminder.kind === 'payday' && daysBetween(reminder.date, today) > PAYDAY_DAYS) return false;
  const state = states.get(reminder.key);
  if (isPutAway(state, today)) return false;
  return !(state?.cleared && canClear(reminder));
};

/* The day Later puts a reminder away until */
export const laterUntil = (reminder: Pick<Reminder, 'kind'>, today: Date) =>
  addDays(today, LATER_DAYS[reminder.kind]);

const byTime = (a: Date, b: Date) => a.getTime() - b.getTime();

/* Everything that reminds, gone off or not */
export const allReminders = (sources: ReminderSources): Reminder[] =>
  [
    ...paymentEvents(sources),
    ...renewalEvents(sources),
    ...noteEvents(sources),
    ...paydayEvents(sources)
  ].map(reminder => ({ ...reminder, read: sources.states.get(reminder.key)?.read ?? false }));

/* New: the ones that have gone off, overdue payments first, then the latest first */
export const newReminders = (sources: ReminderSources) =>
  allReminders(sources)
    .filter(reminder => isNew(reminder, sources))
    .sort(
      (a, b) =>
        Number(b.kind === 'overdue') - Number(a.kind === 'overdue') ||
        byTime(b.firesOn!, a.firesOn!) ||
        byTime(a.date, b.date)
    );

// A yearly payment renews with each payment, so ahead of time its renewal says it all
const isYearlyDue = (reminder: Reminder) =>
  reminder.kind === 'due' && reminder.payment?.frequency === 'ANNUALLY';

/* Coming up: what's ahead, soonest first */
export const upcomingReminders = (sources: ReminderSources) =>
  allReminders(sources)
    .filter(
      reminder =>
        reminder.date >= sources.today &&
        reminder.kind !== 'overdue' &&
        reminder.kind !== 'renewed' &&
        !isYearlyDue(reminder)
    )
    .sort((a, b) => byTime(a.date, b.date) || a.name.localeCompare(b.name));

const FILTER_KINDS: Record<Exclude<ReminderFilter, 'all'>, ReminderKind[]> = {
  payments: ['due', 'overdue', 'payday'],
  renewals: ['renewal', 'renewed'],
  notes: ['note']
};

export const filterReminders = (reminders: Reminder[], filter: ReminderFilter) =>
  filter === 'all'
    ? reminders
    : reminders.filter(reminder => FILTER_KINDS[filter].includes(reminder.kind));

/* "Today", "Yesterday", "25 Sep", or "Overdue": when a reminder in New went off */
export const firedText = (reminder: Reminder, today: Date) => {
  if (reminder.kind === 'overdue') return 'Overdue';
  const days = daysBetween(reminder.firesOn!, today);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return formatShortDate(reminder.firesOn!, today).replace(/^\w+ /, '');
};

/* "4 new", for the More menu */
export const countText = (count: number) => (count ? `${count} new` : 'Nothing new');

/* "Payment · Debt", "Renewal · has a note", "Note", "Payday": what a Coming up row is */
export const kindText = (reminder: Reminder) => {
  switch (reminder.kind) {
    case 'due':
    case 'overdue':
      return reminder.payment?.debt ? 'Payment · Debt' : 'Payment';
    case 'renewal':
    case 'renewed':
      return reminder.paymentNote ? 'Renewal · has a note' : 'Renewal';
    case 'note':
      return 'Note';
    case 'payday':
      return 'Payday';
  }
};
