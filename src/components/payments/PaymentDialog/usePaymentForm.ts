import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { addOneOffPayment, addRecurringPayment } from '~/graphql/cache';
import {
  CreateOneOffPaymentDocument,
  CreateRecurringPaymentDocument,
  OneOffPaymentCategory,
  PaymentFrequency,
  PaymentType,
  RecurringPaymentCategory,
  UpdateOneOffPaymentDocument,
  UpdateRecurringPaymentDocument
} from '~/graphql/generated';
import { addDays, formatShortDay, parseIsoDate, toApiDate } from '~/lib/dates';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import {
  addYear,
  DEFAULT_REMINDER,
  formatShortDate,
  nextOccurrence,
  occurrencesBetween,
  Payment,
  PaymentKind,
  REMINDER_LABELS,
  ReminderDays,
  scheduleText,
  toReminderDays
} from '~/lib/payments';
import { showToast } from '~/state/toast';
import { paidOffText, parseApr } from './debtFields';

// How a recurring payment ends: it carries on, renews on a date (the payments carry on), or stops
// after a last payment. One choice, so a renewal and a last payment can't both be set.
export type Ends = 'keep' | 'renew' | 'stop';

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
  // Null until chosen: a month for a renewal, off for a yearly payment
  reminder: ReminderDays | null;
  category: RecurringPaymentCategory | OneOffPaymentCategory;
  // Recurring payments tracked as a debt: what's owed now, its APR, and what was borrowed
  tracked: boolean;
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

const initialValues = (
  kind: PaymentKind,
  payment: Payment | undefined,
  today: Date,
  asDebt = false
): PaymentFormValues => {
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
    reminder: null,
    category: asDebt ? 'CREDIT_CARD' : kind === 'recurring' ? 'SUBSCRIPTION' : 'OTHER',
    tracked: asDebt,
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
    category: payment.category
  };
  return payment.kind === 'recurring'
    ? {
        ...common,
        frequency: payment.frequency,
        first: iso(payment.firstPaymentDate),
        ends: payment.lastPaymentDate ? 'stop' : payment.renewalDate ? 'renew' : 'keep',
        end: iso(payment.lastPaymentDate),
        renewal: iso(payment.renewalDate),
        // A reminder only means something with a renewal, or on a yearly payment
        reminder:
          payment.renewalDate || payment.frequency === 'ANNUALLY'
            ? toReminderDays(payment.renewalReminderDays)
            : null,
        tracked: payment.debt !== null,
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
 * Renews is Keeps going, and their reminder counts back from each payment. A debt ends when it's
 * paid off, so it keeps going with no renewal or reminder.
 */
const recurringEnding = (values: PaymentFormValues) => {
  const yearly = values.frequency === 'ANNUALLY';
  if (values.tracked) {
    return { yearly, ends: 'keep' as Ends, reminds: false, reminder: 0 as ReminderDays };
  }
  const ends: Ends = yearly && values.ends === 'renew' ? 'keep' : values.ends;
  const reminds = ends === 'renew' || (ends === 'keep' && yearly);
  const reminder: ReminderDays = values.reminder ?? (yearly ? 0 : DEFAULT_REMINDER);
  return { yearly, ends, reminds, reminder };
};

/* A recurring payment's ending as the API takes it */
const endingFields = (values: PaymentFormValues) => {
  const { ends, reminds, reminder } = recurringEnding(values);
  return {
    lastPaymentDate: ends === 'stop' ? values.end : null,
    renewalDate: ends === 'renew' ? values.renewal : null,
    renewalReminderDays: reminds ? reminder : 0
  };
};

const sameEnding = (a: PaymentFormValues, b: PaymentFormValues) => {
  const x = endingFields(a);
  const y = endingFields(b);
  return (
    x.lastPaymentDate === y.lastPaymentDate &&
    x.renewalDate === y.renewalDate &&
    x.renewalReminderDays === y.renewalReminderDays
  );
};

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

/* Whether the form still holds what the payment already has */
const isUnchanged = (values: PaymentFormValues, before: PaymentFormValues) =>
  values.name.trim() === before.name &&
  parseMoney(values.amount) === parseMoney(before.amount) &&
  values.type === before.type &&
  values.category === before.category &&
  values.date === before.date &&
  values.frequency === before.frequency &&
  values.first === before.first &&
  sameEnding(values, before) &&
  values.tracked === before.tracked &&
  sameDebt(values, before);

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
  today: Date,
  { renewalPassed = false } = {}
): { rows: SummaryRow[]; message?: string } => {
  const first = parseIsoDate(values.first);
  const { yearly, ends, reminds, reminder } = recurringEnding(values);
  const end = ends === 'stop' ? parseIsoDate(values.end) : undefined;
  if (!first) return { rows: [], message: 'Choose a first payment date to see the schedule' };
  if (ends === 'stop' && !end) return { rows: [], message: 'Choose a last payment date' };
  if (end && end < first) {
    return { rows: [], message: 'The last payment must be on or after the first' };
  }

  const next = nextOccurrence({ firstPaymentDate: first, frequency: values.frequency }, today);
  const noneLeft = !next || (!!end && end < next);
  const rows: SummaryRow[] = [
    { label: 'Repeats', value: scheduleText(first, values.frequency) },
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
        reminder > 0
          ? `${formatShortDate(addDays(renewsOn, -reminder), today)} · ${REMINDER_LABELS[reminder]} before`
          : 'Off'
    });
  }
  return { rows };
};

/* A debt's summary also says when it'd be paid off */
const withPaidOff = (
  summary: ReturnType<typeof scheduleSummary>,
  values: PaymentFormValues,
  today: Date
) =>
  values.tracked && !summary.message
    ? {
        rows: [
          ...summary.rows,
          {
            label: 'Paid off',
            value: paidOffText(
              {
                balance: parseMoney(values.balance),
                apr: parseApr(values.apr),
                amount: parseMoney(values.amount),
                frequency: values.frequency
              },
              today
            )
          }
        ]
      }
    : summary;

/* What the chosen ending means, under the Ends choice */
export const endsHint = (values: PaymentFormValues, today: Date) => {
  const { yearly, ends } = recurringEnding(values);
  if (ends === 'renew') return 'A policy or contract renews on a date. The payments carry on.';
  if (ends === 'stop') {
    return 'For loans, finance or anything that finishes. Nothing is due after the last payment.';
  }
  const first = parseIsoDate(values.first);
  const next =
    first && nextOccurrence({ firstPaymentDate: first, frequency: values.frequency }, today);
  return yearly && next
    ? `Renews with each payment · next on ${formatShortDay(next, { withYear: true })}`
    : 'Carries on until you change or delete it';
};

interface Options {
  kind: PaymentKind;
  // Opened from Debts, so it's always a debt
  asDebt?: boolean;
  accountId: string;
  payment: Payment | undefined;
  today: Date;
  onSaved: () => void;
  // Changes when the dialog switches to another payment or kind, which starts the form afresh
  formKey: string;
}

/* The add or edit payment form: its values, what's wrong with them, and saving */
export const usePaymentForm = ({
  kind,
  asDebt = false,
  accountId,
  payment,
  today,
  onSaved,
  formKey
}: Options) => {
  const [values, setValues] = useState(() => initialValues(kind, payment, today, asDebt));
  const [touched, setTouched] = useState(UNTOUCHED);
  const [nameTaken, setNameTaken] = useState<string>();
  const [saving, setSaving] = useState(false);

  // A different payment or kind: start again from its values (React's "reset state on a prop
  // change" pattern, without an effect)
  const [currentKey, setCurrentKey] = useState(formKey);
  if (formKey !== currentKey) {
    setCurrentKey(formKey);
    setValues(initialValues(kind, payment, today, asDebt));
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
      // A debt is always money out. A new one still on the default category is likely a loan.
      if (key === 'tracked' && value) {
        next.type = 'EXPENSE';
        if (!payment && current.category === 'SUBSCRIPTION') next.category = 'LOAN';
      }
      return next;
    });
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
            first,
            renewal
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
    if (payment && isUnchanged(values, initialValues(kind, payment, today, asDebt))) {
      onSaved();
      return;
    }
    const common = { name, amount: amount!, type: values.type };
    setSaving(true);
    try {
      if (kind === 'recurring') {
        const schedule = { frequency: values.frequency, firstPaymentDate: values.first };
        const category = values.category as RecurringPaymentCategory;
        if (payment) {
          const before = initialValues(kind, payment, today, asDebt);
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
                accountId,
                ...(values.tracked ? { debt: debtFields(values) } : {})
              }
            },
            update: (cache, { data }) => {
              if (data)
                addRecurringPayment(
                  cache,
                  accountId,
                  data.createRecurringPayment.recurringPayment!
                );
            }
          });
        }
      } else {
        const fields = {
          ...common,
          dueDate: values.date,
          category: values.category as OneOffPaymentCategory
        };
        if (payment) {
          await updateOneOff({ variables: { id: payment.id, input: fields } });
        } else {
          await createOneOff({
            variables: { input: { ...fields, accountId } },
            update: (cache, { data }) => {
              if (data) addOneOffPayment(cache, accountId, data.createOneOffPayment.oneOffPayment!);
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

  return {
    values,
    set,
    touch: (field: TouchedField) => setTouched(current => ({ ...current, [field]: true })),
    errors,
    canSave: nameOk && amountOk && datesOk && debtOk && !nameTaken,
    saving,
    save: () => void save(),
    summary: withPaidOff(scheduleSummary(values, today, { renewalPassed }), values, today),
    // Opened from Debts: always a debt, so there's no switch to stop tracking it
    asDebt,
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
