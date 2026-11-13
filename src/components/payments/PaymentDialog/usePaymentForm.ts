import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { addOneOffPayment, addRecurringPayment } from '~/graphql/cache';
import {
  CreateOneOffPaymentDocument,
  CreateRecurringPaymentDocument,
  NonWorkingDay,
  OneOffPaymentInput,
  PaymentCategory,
  PaymentFrequency,
  PaymentType,
  RecurringPaymentInput,
  UpdateOneOffPaymentDocument,
  UpdateRecurringPaymentDocument
} from '~/graphql/generated';
import { addDays, formatShortDay, parseIsoDate, toApiDate } from '~/lib/dates';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import {
  addYear,
  categoriesFor,
  DateMove,
  daysBeforeText,
  formatShortDate,
  fromTimingChoice,
  goesOutOn,
  movedHow,
  NON_WORKING_DAY_LABELS,
  NON_WORKING_DAYS,
  nextOccurrence,
  nonWorkingReason,
  occurrencesBetween,
  Payment,
  PAYMENT_REMINDER_DAYS,
  PaymentKind,
  reminderDays,
  ReminderSettings,
  RENEWAL_REMINDER_DAYS,
  scheduleText,
  TimingChoice,
  timingOptions,
  toTimingChoice
} from '~/lib/payments';
import { showToast } from '~/state/toast';
import { paidOffRow, parseApr } from './debtFields';
import { accountChoices, FormAccount } from './paymentAccounts';

// How a recurring payment ends: it carries on, renews on a date (the payments carry on), or stops
// after a last payment. One choice, so a renewal and a last payment can't both be set.
export type Ends = 'keep' | 'renew' | 'stop';

// What a recurring expense is: paid to someone else, paying off a debt, or moving money into
// another of the budget's accounts. Only one at a time.
export type PaymentRole = 'payment' | 'debt' | 'move';

interface PaymentFormValues {
  type: PaymentType;
  name: string;
  amount: string;
  // One-off payments: 'YYYY-MM-DD'
  date: string;
  // Recurring payments
  frequency: PaymentFrequency;
  first: string;
  ends: Ends;
  end: string;
  renewal: string;
  // When the reminders before each payment and before it renews go off
  dueReminder: TimingChoice;
  reminder: TimingChoice;
  category: PaymentCategory;
  // Recurring payments tracked as a debt: what's owed now, its APR, and what was borrowed
  tracked: boolean;
  // The account it goes out of, or an income lands in; '' for the one pay lands in
  account: string;
  // Another account a recurring expense moves money into, like a standing order; '' for none
  paysInto: string;
  // When a recurring payment's date on a weekend or bank holiday goes out; 'usual' for the budget's
  nonWorkingDay: NonWorkingDay | 'usual';
  balance: string;
  apr: string;
  started: string;
}

type TouchedField = 'name' | 'amount' | 'balance' | 'apr' | 'started';
const UNTOUCHED: Record<TouchedField, boolean> = {
  name: false,
  amount: false,
  balance: false,
  apr: false,
  started: false
};

const iso = (date: Date | null) => (date ? toApiDate(date) : '');

const initialValues = ({
  kind,
  payment,
  today,
  asDebt = false
}: {
  kind: PaymentKind;
  payment: Payment | undefined;
  today: Date;
  asDebt?: boolean;
}): PaymentFormValues => {
  const blank: PaymentFormValues = {
    type: 'EXPENSE',
    name: '',
    amount: '',
    date: iso(addDays(today, 7)),
    frequency: 'MONTHLY',
    first: iso(today),
    ends: 'keep',
    end: '',
    renewal: '',
    dueReminder: 'usual',
    reminder: 'usual',
    category: asDebt ? 'FINANCES' : kind === 'recurring' ? 'SUBSCRIPTIONS' : 'GENERAL',
    tracked: asDebt,
    account: '',
    paysInto: '',
    nonWorkingDay: 'usual',
    balance: '',
    apr: '',
    started: ''
  };
  if (!payment) return blank;

  const common = {
    ...blank,
    type: payment.type,
    name: payment.name,
    amount: formatMoneyInput(payment.amount),
    category: payment.category,
    dueReminder: toTimingChoice(payment.dueReminder),
    account: payment.account ?? ''
  };
  return payment.kind === 'recurring'
    ? {
        ...common,
        frequency: payment.frequency,
        first: iso(payment.firstPaymentDate),
        ends: payment.lastPaymentDate ? 'stop' : payment.renewalDate ? 'renew' : 'keep',
        end: iso(payment.lastPaymentDate),
        renewal: iso(payment.renewalDate),
        reminder: toTimingChoice(payment.renewalReminder),
        tracked: payment.debt !== null,
        paysInto: payment.paysInto ?? '',
        nonWorkingDay: payment.nonWorkingDay ?? 'usual',
        balance: payment.debt ? formatMoneyInput(payment.debt.balance) : '',
        apr: payment.debt ? String(payment.debt.apr) : '',
        started:
          payment.debt?.startingBalance != null
            ? formatMoneyInput(payment.debt.startingBalance)
            : ''
      }
    : { ...common, date: iso(payment.dueDate) };
};

/*
 * The recurring fields once the rules apply: yearly payments renew with each payment, so for them
 * Renews is Keeps going, and their renewal reminder counts back from each payment. A debt ends when
 * it's paid off, so it keeps going with no renewal.
 */
const recurringEnding = (values: PaymentFormValues) => {
  const yearly = values.frequency === 'ANNUALLY';
  if (values.tracked) return { yearly, ends: 'keep' as Ends, reminds: false };
  const ends: Ends = yearly && values.ends === 'renew' ? 'keep' : values.ends;
  return { yearly, ends, reminds: ends === 'renew' || (ends === 'keep' && yearly) };
};

/* A recurring payment's ending and reminders as the API takes them */
const endingFields = (values: PaymentFormValues) => {
  const { ends } = recurringEnding(values);
  return {
    lastPaymentDate: ends === 'stop' ? values.end : null,
    renewalDate: ends === 'renew' ? values.renewal : null,
    dueReminder: fromTimingChoice(values.dueReminder),
    renewalReminder: fromTimingChoice(values.reminder)
  };
};

const sameEnding = (a: PaymentFormValues, b: PaymentFormValues) =>
  JSON.stringify(endingFields(a)) === JSON.stringify(endingFields(b));

// A debt's figures as the API takes them, or null when it isn't one or they aren't filled in yet
const debtFields = (values: PaymentFormValues) => {
  const balance = parseMoney(values.balance);
  const apr = parseApr(values.apr);
  if (!values.tracked || balance === null || apr === null) return null;
  return {
    balance,
    apr,
    startingBalance: values.started.trim() ? parseMoney(values.started) : null
  };
};

const sameDebt = (a: PaymentFormValues, b: PaymentFormValues) => {
  const x = debtFields(a);
  const y = debtFields(b);
  return (
    x?.balance === y?.balance && x?.apr === y?.apr && x?.startingBalance === y?.startingBalance
  );
};

// Only an expense that isn't a debt can move money into another account
const paysIntoOf = (values: PaymentFormValues, accounts: readonly FormAccount[]) =>
  accountChoices(values, accounts).into?.id ?? null;
const fromOf = (values: PaymentFormValues, accounts: readonly FormAccount[]) =>
  accountChoices(values, accounts).from?.id ?? null;

/* Whether the form still holds what the payment already has */
const isUnchanged = (
  values: PaymentFormValues,
  { before, accounts }: { before: PaymentFormValues; accounts: readonly FormAccount[] }
) =>
  values.name.trim() === before.name &&
  paysIntoOf(values, accounts) === paysIntoOf(before, accounts) &&
  fromOf(values, accounts) === fromOf(before, accounts) &&
  parseMoney(values.amount) === parseMoney(before.amount) &&
  values.type === before.type &&
  values.category === before.category &&
  values.date === before.date &&
  values.dueReminder === before.dueReminder &&
  values.nonWorkingDay === before.nonWorkingDay &&
  values.frequency === before.frequency &&
  values.first === before.first &&
  sameEnding(values, before) &&
  values.tracked === before.tracked &&
  sameDebt(values, before);

const sameSchedule = (values: PaymentFormValues, before: PaymentFormValues) =>
  values.frequency === before.frequency &&
  values.first === before.first &&
  sameEnding(values, before);

export interface SummaryRow {
  label: string;
  value: string;
}

/*
 * A recurring payment's schedule as short rows: Repeats, Next due, then Renews or Last payment,
 * and the reminder. A message instead while there's nothing to show yet.
 */
const scheduleSummary = (
  values: PaymentFormValues,
  {
    today,
    settings,
    move,
    renewalPassed = false
  }: { today: Date; settings: ReminderSettings; move?: DateMove; renewalPassed?: boolean }
): { rows: SummaryRow[]; message?: string } => {
  const first = parseIsoDate(values.first);
  const { yearly, ends, reminds } = recurringEnding(values);
  const reminder = reminderDays(fromTimingChoice(values.reminder), settings.renewalDays);
  const end = ends === 'stop' ? parseIsoDate(values.end) : undefined;
  if (!first) return { rows: [], message: 'Choose a first payment date to see the schedule' };
  if (ends === 'stop' && !end) return { rows: [], message: 'Choose a last payment date' };
  if (end && end < first) {
    return { rows: [], message: 'The last payment must be on or after the first' };
  }

  const next = nextOccurrence(
    { firstPaymentDate: first, frequency: values.frequency, move },
    today
  );
  const noneLeft = !next || (!!end && end < next);
  const rows: SummaryRow[] = [
    { label: 'Repeats', value: scheduleText(first, { frequency: values.frequency }) },
    {
      label: 'Next due',
      value: noneLeft
        ? 'No payments left'
        : next.getTime() === today.getTime()
          ? 'Today'
          : formatShortDate(next, today)
    }
  ];
  const renewal = parseIsoDate(values.renewal);
  if (ends === 'renew' && renewal && !renewalPassed) {
    rows.push({ label: 'Renews', value: formatShortDay(renewal, { withYear: true }) });
  }
  if (end) {
    rows.push({
      label: 'Last payment',
      value: formatShortDay(end, { withYear: true }) + (noneLeft ? '' : ' · then stops')
    });
  }
  // A yearly payment renews with each payment, so its reminder counts back from the next one
  const renewsOn = yearly ? next : ends === 'renew' ? renewal : undefined;
  if (reminds && renewsOn && !renewalPassed) {
    rows.push({
      label: 'Reminder',
      value:
        reminder === null
          ? 'Off'
          : `${formatShortDate(addDays(renewsOn, -reminder), today)} · ${daysBeforeText(reminder).toLowerCase()}`
    });
  }
  return { rows };
};

/* A debt's summary also says when it'd be paid off */
const withPaidOff = (
  summary: ReturnType<typeof scheduleSummary>,
  { values, today }: { values: PaymentFormValues; today: Date }
) =>
  values.tracked && !summary.message
    ? {
        rows: [
          ...summary.rows,
          paidOffRow(
            {
              balance: parseMoney(values.balance),
              apr: parseApr(values.apr),
              amount: parseMoney(values.amount),
              frequency: values.frequency
            },
            today
          )
        ]
      }
    : summary;

/*
 * The line under the Ends choice, only when it says something the choice doesn't: a yearly payment
 * that keeps going renews with each payment
 */
export const endsHint = (values: PaymentFormValues, today: Date) => {
  const { yearly, ends } = recurringEnding(values);
  if (!yearly || ends !== 'keep') return null;
  const first = parseIsoDate(values.first);
  const next =
    first && nextOccurrence({ firstPaymentDate: first, frequency: values.frequency }, today);
  return next
    ? `Renews with each payment · next on ${formatShortDay(next, { withYear: true })}`
    : null;
};

/* The schedule summary as one line: "Next due Sat 24 Oct · renews 24 Oct 2027". Repeats is in its
   own field and the reminder is under More options, so they're left out. */
const summaryLine = (summary: { rows: SummaryRow[]; message?: string }) =>
  summary.message ??
  summary.rows
    .filter(row => row.label !== 'Repeats' && row.label !== 'Reminder')
    .map((row, index) => {
      if (row.value === 'No payments left') return row.value;
      // Mid-sentence, so lower case, except a date: "paid off about May 2028", "renews Sat 24 Oct"
      const value =
        /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.test(
          row.value
        )
          ? row.value
          : row.value[0].toLowerCase() + row.value.slice(1);
      // A row that says it all has no label
      if (!row.label) return value;
      return `${index === 0 ? row.label : row.label.toLowerCase()} ${value}`;
    })
    .join(' · ');

/* A reminder's timing in the More options line: "remind 1 day before", "no reminder" */
const reminderText = (choice: TimingChoice, usual: number) => {
  const days = reminderDays(fromTimingChoice(choice), usual);
  return days === null ? 'no reminder' : `remind ${daysBeforeText(days).toLowerCase()}`;
};

// What More options' line says for a payment with its own choice for weekends and bank holidays
const NON_WORKING_DAY_SUMMARY: Record<NonWorkingDay, string> = {
  NEXT: 'weekends move to the next working day',
  BEFORE: 'weekends move to the working day before',
  ON_DAY: 'goes out at weekends'
};

// Far enough ahead to find a weekend for any schedule but a yearly one that keeps missing them
const LOOK_AHEAD = 24;

/*
 * Under the weekends field: what the next date on a weekend or bank holiday does with the choice,
 * "Sat 24 Oct is a Saturday, so it goes out the next working day, Mon 26 Oct."
 */
const nonWorkingDayHint = (
  values: PaymentFormValues,
  { today, move }: { today: Date; move: DateMove }
) => {
  const first = parseIsoDate(values.first);
  if (!first) return 'Choose a first payment date to see which dates move';
  const { ends } = recurringEnding(values);
  const end = ends === 'stop' ? parseIsoDate(values.end) : null;
  const schedule = { firstPaymentDate: first, frequency: values.frequency, lastPaymentDate: end };
  let date = nextOccurrence(schedule, today);
  for (let i = 0; date && i < LOOK_AHEAD; i++) {
    if (goesOutOn(date, { ...move, rule: 'NEXT' }).getTime() !== date.getTime()) {
      const reason = `${formatShortDate(date, today)} is ${nonWorkingReason(date, move.holidays)}`;
      return move.rule === 'ON_DAY'
        ? `${reason}. It still goes out that day.`
        : `${reason}, so it goes out ${movedHow(move.rule)}, ${formatShortDate(goesOutOn(date, move), today)}.`;
    }
    date = nextOccurrence(schedule, addDays(date, 1));
  }
  return 'None of its next dates fall on a weekend or bank holiday.';
};

interface Options {
  kind: PaymentKind;
  // Opened from Debts, so it's always a debt
  asDebt?: boolean;
  budgetId: string;
  payment: Payment | undefined;
  today: Date;
  // The budget's usual reminder timing, for payments that follow it
  settings: ReminderSettings;
  // The budget's accounts, for which one it goes out of and moving money between them
  accounts: readonly FormAccount[];
  onSaved: () => void;
  // Changes when the dialog switches to another payment or kind, which starts the form afresh
  formKey: string;
  // Setup: hands over the payment as the API would take it instead of saving it, returning a
  // message when its name is already used
  draft?: (payment: DraftPayment) => string | undefined;
  // A new payment's name, category and type to start with, e.g. from a suggestion
  start?: { name: string; category: PaymentCategory; type?: PaymentType };
  // A new recurring payment that moves money into this account, from the account's view
  into?: string;
  // The budget's choice for dates on a weekend or bank holiday, and the holidays. Left out (in
  // setup) there's no choice to make.
  usualMove?: DateMove;
}

/* A payment as setup keeps it until the budget is made */
export type DraftPayment =
  | { kind: 'recurring'; input: RecurringPaymentInput }
  | { kind: 'oneOff'; input: OneOffPaymentInput };

/* The add or edit payment form: its values, what's wrong with them, and saving */
export const usePaymentForm = ({
  kind,
  asDebt = false,
  budgetId,
  payment,
  today,
  settings,
  accounts,
  onSaved,
  formKey,
  draft,
  start,
  into,
  usualMove
}: Options) => {
  const startValues = () => {
    const values = {
      ...initialValues({ kind, payment, today, asDebt }),
      ...(payment || !start ? {} : start)
    };
    if (payment || !into || kind !== 'recurring') return values;
    const target = accounts.find(account => account.id === into);
    return {
      ...values,
      paysInto: into,
      category: target?.kind === 'SAVINGS' ? 'SAVINGS' : values.category
    };
  };
  // Editing, More options starts open when something in it isn't the default, so a value that's
  // been set is never folded away
  const moreStartsOpen = (start: PaymentFormValues) => {
    if (!payment) return false;
    const { several, paidInto } = accountChoices(start, accounts);
    const ending = recurringEnding(start);
    return (
      (several && !!start.account && start.account !== paidInto?.id) ||
      start.dueReminder !== 'usual' ||
      (kind === 'recurring' && start.nonWorkingDay !== 'usual') ||
      (kind === 'recurring' && ending.reminds && start.reminder !== 'usual')
    );
  };
  const [values, setValues] = useState(startValues);
  const [moreOpen, setMoreOpen] = useState(() => moreStartsOpen(values));
  const [touched, setTouched] = useState(UNTOUCHED);
  const [nameTaken, setNameTaken] = useState<string>();
  const [saving, setSaving] = useState(false);

  // A different payment or kind: start again from its values (React's "reset state on a prop
  // change" pattern, without an effect)
  const [currentKey, setCurrentKey] = useState(formKey);
  if (formKey !== currentKey) {
    const fresh = startValues();
    setCurrentKey(formKey);
    setValues(fresh);
    setMoreOpen(moreStartsOpen(fresh));
    setTouched(UNTOUCHED);
    setNameTaken(undefined);
  }

  const [createRecurring] = useMutation(CreateRecurringPaymentDocument);
  const [updateRecurring] = useMutation(UpdateRecurringPaymentDocument);
  const [createOneOff] = useMutation(CreateOneOffPaymentDocument);
  const [updateOneOff] = useMutation(UpdateOneOffPaymentDocument);

  const set = <K extends keyof PaymentFormValues>(key: K, value: PaymentFormValues[K]) => {
    if (key === 'name') setNameTaken(undefined);
    setValues(current => {
      const next = { ...current, [key]: value };
      // Choosing an ending suggests a date: a last payment a year after the next payment, a
      // renewal a year from today
      if (key === 'ends' && value === 'stop' && !current.end) {
        const first = parseIsoDate(current.first);
        const upcoming =
          first && nextOccurrence({ firstPaymentDate: first, frequency: current.frequency }, today);
        if (upcoming) next.end = iso(addYear(upcoming));
      }
      if (key === 'ends' && value === 'renew' && !current.renewal) {
        next.renewal = iso(addYear(today));
      }
      // A debt is always money out. A new one still on the default category belongs in Finances.
      if (key === 'tracked' && value) {
        next.type = 'EXPENSE';
        if (!payment && current.category === 'SUBSCRIPTIONS') next.category = 'FINANCES';
      }
      // Money in and out have their own categories, so one that doesn't suit the new type moves
      if (key === 'type' && !categoriesFor(next.type).includes(next.category)) {
        next.category = next.type === 'INCOME' ? 'INCOME' : 'GENERAL';
      }
      return next;
    });
  };

  const choices = accountChoices(values, accounts);
  const role: PaymentRole = values.tracked ? 'debt' : choices.into ? 'move' : 'payment';

  // Picking what it is sets the debt and money-moving fields together, so only one is on
  const setRole = (next: PaymentRole) => {
    set('tracked', next === 'debt');
    set('paysInto', next === 'move' ? (choices.into?.id ?? choices.targets[0]?.id ?? '') : '');
  };

  const amount = parseMoney(values.amount);
  const first = parseIsoDate(values.first);
  const end = parseIsoDate(values.end);
  const renewal = parseIsoDate(values.renewal);
  const ending = recurringEnding(values);
  const { ends } = ending;
  const nameOk = values.name.trim().length > 0;
  const amountOk = amount !== null && amount > 0;
  const endBad = ends === 'stop' && !!first && !!end && end < first;
  const renewalBad = ends === 'renew' && !!first && !!renewal && renewal <= first;
  const balance = parseMoney(values.balance);
  const apr = parseApr(values.apr);
  // A new debt owes something; an existing one may have just been paid off
  const balanceOk = balance !== null && (balance > 0 || !!payment);
  const aprOk = apr !== null;
  const startedOk = !values.started.trim() || parseMoney(values.started) !== null;
  const debtOk = kind !== 'recurring' || !values.tracked || (balanceOk && aprOk && startedOk);
  const datesOk =
    kind === 'oneOff'
      ? !!parseIsoDate(values.date)
      : !!first &&
        (ends !== 'stop' || (!!end && !endBad)) &&
        (ends !== 'renew' || (!!renewal && !renewalBad));

  // The saved renewal has gone by and hasn't been moved on yet, so the form asks about the next one
  const savedRenewal = payment?.kind === 'recurring' ? payment.renewalDate : null;
  const savedPassed = !!savedRenewal && savedRenewal < today;
  const renewalPassed = ends === 'renew' && savedPassed && values.renewal === iso(savedRenewal);

  const errors = {
    name: nameTaken ?? (touched.name && !nameOk ? 'Enter a name' : undefined),
    amount: touched.amount && !amountOk ? 'Enter an amount above £0' : undefined,
    end: endBad ? 'Choose a date on or after the first payment' : undefined,
    renewal: renewalBad ? 'Choose a date after the first payment' : undefined,
    balance: touched.balance && !balanceOk ? 'Enter what you owe now' : undefined,
    apr: touched.apr && !aprOk ? 'Enter a rate from 0 to 100%' : undefined,
    started: touched.started && !startedOk ? 'Enter an amount, or leave it empty' : undefined
  };

  // Set next renewal: the same day a year on, or as many years on as it takes to reach today
  const setNextRenewal = () => {
    if (!renewal) return;
    let next = addYear(renewal);
    while (next < today) next = addYear(next);
    setValues(current => ({ ...current, renewal: iso(next) }));
  };

  // No longer renews: it stops instead, after the last payment on or before the renewal
  const stopAtRenewal = () => {
    const lastBefore =
      first && renewal
        ? occurrencesBetween(
            { firstPaymentDate: first, frequency: values.frequency },
            { from: first, to: renewal }
          ).at(-1)
        : undefined;
    setValues(current => ({
      ...current,
      ends: 'stop',
      end: lastBefore ? iso(lastBefore) : current.end
    }));
  };

  const save = async () => {
    if (!nameOk || !amountOk || !datesOk || !debtOk) {
      setTouched({ name: true, amount: true, balance: true, apr: true, started: true });
      return;
    }
    const name = values.name.trim();
    // Editing without changing anything just closes
    const before = payment ? initialValues({ kind, payment, today, asDebt }) : null;
    if (before && isUnchanged(values, { before, accounts })) {
      onSaved();
      return;
    }
    const { several, from } = accountChoices(values, accounts);
    // With more than one to spend from, saving says which account, so it's no longer unchosen
    const account = several && from ? from.id : null;
    const accountField = (saved: string | null) =>
      account && account !== saved ? { account } : {};
    const common = { name, amount: amount!, type: values.type };
    // Sent when it changes; null goes back to the budget's choice
    const nonWorkingDayField = (saved: NonWorkingDay | null) => {
      const chosen = values.nonWorkingDay === 'usual' ? null : values.nonWorkingDay;
      return chosen !== saved ? { nonWorkingDay: chosen } : {};
    };
    if (draft) {
      const paysInto = paysIntoOf(values, accounts);
      const taken = draft(
        kind === 'recurring'
          ? {
              kind,
              input: {
                ...common,
                frequency: values.frequency,
                firstPaymentDate: values.first,
                ...endingFields(values),
                category: values.category,
                ...(account ? { account } : {}),
                ...(paysInto ? { paysInto } : {}),
                ...nonWorkingDayField(null),
                ...(values.tracked ? { debt: debtFields(values) } : {})
              }
            }
          : {
              kind,
              input: {
                ...common,
                dueDate: values.date,
                category: values.category,
                dueReminder: fromTimingChoice(values.dueReminder),
                ...(account ? { account } : {})
              }
            }
      );
      if (taken) setNameTaken(taken);
      else onSaved();
      return;
    }
    setSaving(true);
    try {
      if (kind === 'recurring') {
        const schedule = { frequency: values.frequency, firstPaymentDate: values.first };
        const category = values.category;
        if (payment && before) {
          // Only send the schedule if it changed: a new schedule starts the payment unpaid again.
          // The ending can always go, as a new last payment keeps what's been paid.
          const scheduleChanged =
            before.frequency !== values.frequency || before.first !== values.first;
          await updateRecurring({
            variables: {
              id: payment.id,
              input: {
                ...common,
                category,
                ...endingFields(values),
                ...(scheduleChanged ? schedule : {}),
                ...accountField(payment.account),
                // Sent when it changes; null stops it
                ...(paysIntoOf(values, accounts) !== paysIntoOf(before, accounts)
                  ? { paysInto: paysIntoOf(values, accounts) }
                  : {}),
                ...nonWorkingDayField(payment.kind === 'recurring' ? payment.nonWorkingDay : null),
                // Sent when it's a debt, and as null to stop tracking one
                ...(values.tracked
                  ? { debt: debtFields(values) }
                  : before.tracked
                    ? { debt: null }
                    : {})
              }
            }
          });
        } else {
          await createRecurring({
            variables: {
              input: {
                ...common,
                ...schedule,
                ...endingFields(values),
                category,
                budgetId,
                ...accountField(null),
                ...(paysIntoOf(values, accounts) ? { paysInto: paysIntoOf(values, accounts) } : {}),
                ...nonWorkingDayField(null),
                ...(values.tracked ? { debt: debtFields(values) } : {})
              }
            },
            update: (cache, { data }) => {
              if (data)
                addRecurringPayment(cache, {
                  budget: budgetId,
                  payment: data.createRecurringPayment.recurringPayment!
                });
            }
          });
        }
      } else {
        const fields = {
          ...common,
          dueDate: values.date,
          category: values.category,
          dueReminder: fromTimingChoice(values.dueReminder)
        };
        if (payment) {
          await updateOneOff({
            variables: { id: payment.id, input: { ...fields, ...accountField(payment.account) } }
          });
        } else {
          await createOneOff({
            variables: { input: { ...fields, ...accountField(null), budgetId } },
            update: (cache, { data }) => {
              if (data)
                addOneOffPayment(cache, {
                  budget: budgetId,
                  payment: data.createOneOffPayment.oneOffPayment!
                });
            }
          });
        }
      }
      showToast({ message: `${payment ? 'Saved' : 'Added'} ${name}` });
      onSaved();
    } catch (error) {
      const code = getErrorCode(error) as string | undefined;
      if (code === 'PAYMENT_EXISTS' || code === 'RECURRING_PAYMENT_EXISTS') {
        setNameTaken(`You already have a payment called ${name}`);
      } else {
        showToast({ message: getApiErrorMessage(error, "Couldn't save that payment. Try again.") });
      }
    } finally {
      setSaving(false);
    }
  };

  // When its weekend dates go out, with the choice made here
  const move =
    kind === 'recurring' && usualMove
      ? {
          ...usualMove,
          rule: values.nonWorkingDay === 'usual' ? usualMove.rule : values.nonWorkingDay
        }
      : undefined;

  // What's under More options, in one line: where it goes out of or into, then the reminders
  const reminds = kind === 'recurring' && ending.reminds && !renewalPassed;
  const renewalDays = reminderDays(fromTimingChoice(values.reminder), settings.renewalDays);
  const moreSummary = [
    choices.several && choices.from
      ? `${values.type === 'INCOME' ? 'Into' : 'From'} ${choices.from.name}`
      : null,
    reminderText(values.dueReminder, settings.paymentDays),
    reminds
      ? renewalDays === null
        ? 'no renewal reminder'
        : `${daysBeforeText(renewalDays).toLowerCase()} it renews`
      : null,
    move && values.nonWorkingDay !== 'usual' ? NON_WORKING_DAY_SUMMARY[values.nonWorkingDay] : null
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    values,
    set,
    role,
    setRole,
    touch: (field: TouchedField) => setTouched(current => ({ ...current, [field]: true })),
    errors,
    canSave: nameOk && amountOk && datesOk && debtOk && !nameTaken,
    saving,
    save: () => void save(),
    // The schedule in one line; where money moves to is in its own field above it
    summary: summaryLine(
      withPaidOff(scheduleSummary(values, { today, settings, move, renewalPassed }), {
        values,
        today
      })
    ),
    more: { open: moreOpen, setOpen: setMoreOpen, summary: moreSummary, reminds },
    // Editing, the title's status line already says when it's next due, so the summary only shows
    // once the schedule changes. A debt's always shows, for when it'd be paid off.
    showSummary:
      !payment ||
      values.tracked ||
      !sameSchedule(values, initialValues({ kind, payment, today, asDebt })),
    // When a date on a weekend or bank holiday goes out: offered for recurring payments, saying
    // what the budget's choice is, and what it does to the next such date
    nonWorkingDay:
      move && usualMove
        ? {
            options: [
              {
                value: 'usual' as const,
                label: `Usual · ${NON_WORKING_DAY_LABELS[usualMove.rule].toLowerCase()}`
              },
              ...NON_WORKING_DAYS.map(rule => ({
                value: rule,
                label: NON_WORKING_DAY_LABELS[rule]
              }))
            ],
            hint: nonWorkingDayHint(values, { today, move })
          }
        : null,
    // The choices for each reminder, saying what the usual timing is
    reminderOptions: {
      due: timingOptions({ days: PAYMENT_REMINDER_DAYS, usual: settings.paymentDays }),
      renewal: timingOptions({ days: RENEWAL_REMINDER_DAYS, usual: settings.renewalDays })
    },
    // Opened from Debts: always a debt, so there's no switch to stop tracking it
    asDebt,
    accounts,
    // Which account it goes out of, and where money can move to
    choices,
    endsHint: endsHint(values, today),
    ending,
    renewalPassed,
    // Moved on from a renewal that had gone by, so the price may have changed with it
    renewalMoved: ends === 'renew' && savedPassed && values.renewal !== iso(savedRenewal),
    setNextRenewal,
    stopAtRenewal
  };
};

export type PaymentForm = ReturnType<typeof usePaymentForm>;
