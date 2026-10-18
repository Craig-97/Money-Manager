import { useState } from 'react';
import { CalendarDays, Repeat, X } from 'lucide-react';
import { DatePicker } from '~/components/form/DatePicker';
import { Select } from '~/components/form/Select';
import { Button } from '~/components/ui/Button';
import { ChipGroup } from '~/components/ui/ChipGroup';
import { IconButton } from '~/components/ui/IconButton';
import { NoteRepeat, PaymentFrequency } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { toIsoDate } from '~/lib/dates';
import {
  followsByDefault,
  REPEAT_LABELS,
  reminderHint,
  remindChoices,
  NoteDraft
} from '~/lib/notes';
import { daysBeforeText, formatShortDate } from '~/lib/payments';
import { NoteDraftState } from '../../useNoteDraft';

// Radix's select can't have an empty value, so no payment is this
const NO_PAYMENT = 'none';

const REPEATS: NoteRepeat[] = ['NONE', 'MONTHLY', 'QUARTERLY', 'BIANNUALLY', 'YEARLY'];

const fieldLabel = 'mb-2 block text-[13px] font-bold text-muted';

export interface NotePaymentOption {
  value: string;
  label: string;
  name: string;
  // Its next date, for a note that follows it
  due: Date | null;
  frequency: PaymentFrequency;
}

interface NoteDateFieldsProps {
  draft: NoteDraftState;
  // The recurring payments a note can be about
  payments: NotePaymentOption[];
  today: Date;
}

/*
 * A note's date, when to be reminded before it, how often it comes round, and the payment it's
 * about. Linked to a payment, it can follow the payment's dates instead of a date of its own.
 * Without a date or a payment it's one row offering to add a date, so a plain note stays short.
 */
export const NoteDateFields = ({ draft, payments, today }: NoteDateFieldsProps) => {
  // Asked to add a date, so the calendar shows before one is picked
  const [adding, setAdding] = useState(false);
  const payment = payments.find(item => item.value === draft.paymentId);
  const follows = draft.repeat === 'WITH_PAYMENT' && !!payment;
  const choices = remindChoices({ repeat: draft.repeat, paymentFrequency: payment?.frequency });
  const hint = reminderHint(draft, {
    today,
    format: date => formatShortDate(date, today),
    paymentDue: payment?.due ?? null
  });

  // Changes that can leave reminders too far apart for how often it comes round drop them
  const change = (changes: Partial<NoteDraft>) => {
    const next = { ...draft.draft, ...changes };
    const nextPayment = payments.find(item => item.value === next.paymentId);
    const allowed = remindChoices({
      repeat: next.repeat,
      paymentFrequency: nextPayment?.frequency
    });
    for (const [key, value] of Object.entries(changes)) {
      draft.set(key as keyof NoteDraft, value as never);
    }
    const remind = next.remind.filter(days => (allowed as readonly number[]).includes(days));
    if (remind.length !== next.remind.length) draft.set('remind', remind);
  };

  const choosePayment = (id: string) => {
    const chosen = payments.find(item => item.value === id);
    if (!chosen) {
      // Unlinked: one that followed it keeps the date it was on
      change(
        follows
          ? { paymentId: '', repeat: 'NONE', date: payment?.due ? toIsoDate(payment.due) : '' }
          : { paymentId: '' }
      );
      return;
    }
    // A note with nothing else set follows a payment that's monthly or less often
    const follow = !draft.date && draft.repeat === 'NONE' && followsByDefault(chosen.frequency);
    change({
      paymentId: id,
      ...(follow
        ? { repeat: 'WITH_PAYMENT', remind: draft.remind.length ? draft.remind : [7] }
        : {})
    });
  };

  const chooseRepeat = (repeat: NoteRepeat) =>
    change({
      repeat,
      // Leaving the payment's dates, it keeps the next one as its own
      ...(repeat !== 'WITH_PAYMENT' && follows && !draft.date && payment?.due
        ? { date: toIsoDate(payment.due) }
        : {})
    });

  if (!draft.date && !adding && !draft.paymentId) {
    return (
      <div className="flex items-center gap-3 rounded-[22px] border border-border bg-surface-2 py-3 pr-3 pl-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold">Date</p>
          <p className="text-[13px] font-medium text-muted">Add one to get reminders before it</p>
        </div>
        <Button onClick={() => setAdding(true)} className="shrink-0 font-bold">
          <CalendarDays size={17} aria-hidden="true" />
          Add a date
        </Button>
      </div>
    );
  }

  const dated = follows || !!draft.date;
  const repeatOptions = [
    ...(payment
      ? [{ value: 'WITH_PAYMENT' as NoteRepeat, label: REPEAT_LABELS.WITH_PAYMENT }]
      : []),
    ...REPEATS.map(value => ({ value, label: REPEAT_LABELS[value] }))
  ];

  return (
    <div className="flex flex-col gap-4 rounded-[22px] border border-border bg-surface-2 p-4">
      <div>
        {follows ? (
          <p id="note-date-label" className={fieldLabel}>
            Date
          </p>
        ) : (
          <label htmlFor="note-date" className={fieldLabel}>
            Date
          </label>
        )}
        {follows ? (
          // Its dates are the payment's, so there's no date of its own to pick
          <p
            aria-labelledby="note-date-label"
            className="flex h-12 items-center gap-2.5 rounded-2xl border border-accent bg-accent-soft px-4 text-[15px] font-bold">
            <Repeat size={16} aria-hidden="true" className="shrink-0 text-accent-text" />
            <span className="min-w-0 truncate">
              {payment.due
                ? `Each ${payment.name} payment · next ${formatShortDate(payment.due, today)}`
                : `Each ${payment.name} payment · none left`}
            </span>
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <DatePicker
              id="note-date"
              value={draft.date}
              onChange={date => draft.set('date', date)}
              placeholder="No date"
              defaultOpen={adding && !draft.date}
              className={cn(
                'flex-1',
                draft.date && 'border-accent bg-accent-soft font-bold [&>svg]:text-accent-text'
              )}
            />
            {draft.date || adding ? (
              <IconButton
                variant="outline"
                aria-label="Take the date off"
                onClick={() => {
                  draft.set('date', '');
                  setAdding(false);
                }}
                className="size-12">
                <X size={18} strokeWidth={2.25} aria-hidden="true" />
              </IconButton>
            ) : null}
          </div>
        )}
      </div>

      {dated ? (
        <>
          <div>
            <p id="note-remind" className={fieldLabel}>
              Remind me
            </p>
            <ChipGroup
              type="multiple"
              aria-labelledby="note-remind"
              value={draft.remind.map(String)}
              onValueChange={values => draft.set('remind', values.map(Number))}
              options={choices.map(days => ({ value: String(days), label: daysBeforeText(days) }))}
              className="[&>button]:max-md:px-3"
            />
          </div>
          <div>
            <p id="note-repeat" className={fieldLabel}>
              Repeat
            </p>
            <ChipGroup
              type="single"
              aria-labelledby="note-repeat"
              value={
                follows ? 'WITH_PAYMENT' : draft.repeat === 'WITH_PAYMENT' ? 'NONE' : draft.repeat
              }
              onValueChange={chooseRepeat}
              options={repeatOptions}
              className="[&>button]:max-md:px-3"
            />
          </div>
        </>
      ) : null}

      {payments.length ? (
        <div>
          <label htmlFor="note-payment" className={fieldLabel}>
            Payment
          </label>
          <Select
            id="note-payment"
            value={draft.paymentId || NO_PAYMENT}
            onValueChange={id => choosePayment(id === NO_PAYMENT ? '' : id)}
            options={[
              { value: NO_PAYMENT, label: 'Not about a payment' },
              ...payments.map(({ value, label }) => ({ value, label }))
            ]}
          />
        </div>
      ) : null}

      {hint ? (
        <p aria-live="polite" className="-mt-1 ml-1 text-xs leading-[1.4] font-semibold text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
