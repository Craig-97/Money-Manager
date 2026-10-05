import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  CreateOneOffPaymentDocument,
  CreateRecurringPaymentDocument,
  EditOneOffPaymentDocument,
  OneOffPaymentCategory,
  PaymentFrequency,
  PaymentType,
  RecurringPaymentCategory,
  UpdateRecurringPaymentDocument
} from '~/graphql/generated';
import { addOneOffPayment, addRecurringPayment } from '~/lib/apollo';
import { addDays, parseIsoDate, toApiDate } from '~/lib/dates';
import { getApiErrorMessage, getErrorCode } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import {
  formatShortDate,
  nextOccurrence,
  Payment,
  PaymentKind,
  scheduleText
} from '~/lib/payments';
import { showToast } from '~/state/toast';

export interface PaymentFormValues {
  type: PaymentType;
  name: string;
  amount: string;
  // One-off payments: 'YYYY-MM-DD'
  date: string;
  // Recurring payments
  frequency: PaymentFrequency;
  first: string;
  hasEnd: boolean;
  end: string;
  category: RecurringPaymentCategory | OneOffPaymentCategory;
}

const iso = (date: Date | null) => (date ? toApiDate(date) : '');

const initialValues = (
  kind: PaymentKind,
  payment: Payment | undefined,
  today: Date
): PaymentFormValues => {
  const blank: PaymentFormValues = {
    type: 'EXPENSE',
    name: '',
    amount: '',
    date: iso(addDays(today, 7)),
    frequency: 'MONTHLY',
    first: iso(today),
    hasEnd: false,
    end: '',
    category: kind === 'recurring' ? 'SUBSCRIPTION' : 'OTHER'
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
        hasEnd: payment.lastPaymentDate !== null,
        end: iso(payment.lastPaymentDate)
      }
    : { ...common, date: iso(payment.dueDate) };
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
  values.hasEnd === before.hasEnd &&
  (!values.hasEnd || values.end === before.end);

/* "Repeats monthly on the 2nd · next due Mon 2 Nov · last Fri 1 Jan" */
export const scheduleSummary = (values: PaymentFormValues, today: Date) => {
  const first = parseIsoDate(values.first);
  const end = values.hasEnd ? parseIsoDate(values.end) : undefined;
  if (!first) return 'Choose a first payment date to see the schedule';
  const repeats = `Repeats ${scheduleText(first, values.frequency, { lower: true })}`;
  if (values.hasEnd && !end) return `${repeats} · choose a last payment date`;
  if (end && end < first) return 'The last payment must be on or after the first';

  const next = nextOccurrence(
    { firstPaymentDate: first, frequency: values.frequency, lastPaymentDate: end },
    today
  );
  const nextText = next
    ? ` · next due ${next.getTime() === today.getTime() ? 'today' : formatShortDate(next, today)}`
    : ' · no payments left';
  return repeats + nextText + (end ? ` · last ${formatShortDate(end, today)}` : '');
};

interface Options {
  kind: PaymentKind;
  accountId: string;
  payment: Payment | undefined;
  today: Date;
  onSaved: () => void;
  // Changes when the dialog switches to another payment or kind, which starts the form afresh
  formKey: string;
}

/* The add or edit payment form: its values, what's wrong with them, and saving */
export const usePaymentForm = ({ kind, accountId, payment, today, onSaved, formKey }: Options) => {
  const [values, setValues] = useState(() => initialValues(kind, payment, today));
  const [touched, setTouched] = useState({ name: false, amount: false });
  const [nameTaken, setNameTaken] = useState<string>();
  const [saving, setSaving] = useState(false);

  // A different payment or kind: start again from its values (React's "reset state on a prop
  // change" pattern, without an effect)
  const [currentKey, setCurrentKey] = useState(formKey);
  if (formKey !== currentKey) {
    setCurrentKey(formKey);
    setValues(initialValues(kind, payment, today));
    setTouched({ name: false, amount: false });
    setNameTaken(undefined);
  }

  const [createRecurring] = useMutation(CreateRecurringPaymentDocument);
  const [updateRecurring] = useMutation(UpdateRecurringPaymentDocument);
  const [createOneOff] = useMutation(CreateOneOffPaymentDocument);
  const [editOneOff] = useMutation(EditOneOffPaymentDocument);

  const set = <K extends keyof PaymentFormValues>(key: K, value: PaymentFormValues[K]) => {
    if (key === 'name') setNameTaken(undefined);
    setValues(current => {
      const next = { ...current, [key]: value };
      // Turning on an end date suggests a year after the first payment
      if (key === 'hasEnd' && value && !current.end) {
        const first = parseIsoDate(current.first);
        if (first)
          next.end = iso(new Date(first.getFullYear() + 1, first.getMonth(), first.getDate()));
      }
      return next;
    });
  };

  const amount = parseMoney(values.amount);
  const first = parseIsoDate(values.first);
  const end = parseIsoDate(values.end);
  const nameOk = values.name.trim().length > 0;
  const amountOk = amount !== null && amount > 0;
  const endBad = values.hasEnd && !!first && !!end && end < first;
  const datesOk =
    kind === 'oneOff'
      ? !!parseIsoDate(values.date)
      : !!first && (!values.hasEnd || (!!end && !endBad));

  const errors = {
    name: nameTaken ?? (touched.name && !nameOk ? 'Enter a name' : undefined),
    amount: touched.amount && !amountOk ? 'Enter an amount above £0' : undefined,
    end: endBad ? 'Choose a date on or after the first payment' : undefined
  };

  const save = async () => {
    if (!nameOk || !amountOk || !datesOk) {
      setTouched({ name: true, amount: true });
      return;
    }
    const name = values.name.trim();
    // Editing without changing anything just closes
    if (payment && isUnchanged(values, initialValues(kind, payment, today))) {
      onSaved();
      return;
    }
    const common = { name, amount: amount!, type: values.type };
    setSaving(true);
    try {
      if (kind === 'recurring') {
        const schedule = {
          frequency: values.frequency,
          firstPaymentDate: values.first,
          lastPaymentDate: values.hasEnd ? values.end : null
        };
        const category = values.category as RecurringPaymentCategory;
        if (payment) {
          const before = initialValues(kind, payment, today);
          // Only send the schedule if it changed: a new schedule starts the payment unpaid again
          const scheduleChanged =
            before.frequency !== values.frequency ||
            before.first !== values.first ||
            before.hasEnd !== values.hasEnd ||
            (values.hasEnd && before.end !== values.end);
          await updateRecurring({
            variables: {
              id: payment.id,
              input: { ...common, category, ...(scheduleChanged ? schedule : {}) }
            }
          });
        } else {
          await createRecurring({
            variables: { input: { ...common, ...schedule, category, accountId } },
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
          await editOneOff({ variables: { id: payment.id, oneOffPayment: fields } });
        } else {
          await createOneOff({
            variables: { oneOffPayment: { ...fields, account: accountId } },
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
    touch: (field: 'name' | 'amount') => setTouched(current => ({ ...current, [field]: true })),
    errors,
    canSave: nameOk && amountOk && datesOk && !nameTaken,
    saving,
    save: () => void save(),
    summary: kind === 'recurring' ? scheduleSummary(values, today) : ''
  };
};

export type PaymentForm = ReturnType<typeof usePaymentForm>;
