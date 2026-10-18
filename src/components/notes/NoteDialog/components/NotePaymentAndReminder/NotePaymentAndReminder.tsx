import { useState } from 'react';
import { Bell, Repeat, X } from 'lucide-react';
import { DatePicker } from '~/components/form/DatePicker';
import { Select } from '~/components/form/Select';
import { Button } from '~/components/ui/Button';
import { ChipGroup } from '~/components/ui/ChipGroup';
import { IconButton } from '~/components/ui/IconButton';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { NoteRepeat, PaymentFrequency } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { formatShortDay, toIsoDate } from '~/lib/dates';
import { defaultRemind, NoteDraft, REPEAT_LABELS, reminderHint, remindChoices } from '~/lib/notes';
import { daysBeforeText, formatShortDate } from '~/lib/payments';
import { NoteDraftState } from '../../useNoteDraft';

// Radix's select can't have an empty value, so no payment is this
const NO_PAYMENT = 'none';

const REPEATS: NoteRepeat[] = ['NONE', 'MONTHLY', 'QUARTERLY', 'BIANNUALLY', 'YEARLY'];

type ReminderWhen = 'payment' | 'date';

const fieldLabel = 'mb-2 block text-[13px] font-bold text-muted';

export interface NotePaymentOption {
  value: string;
  label: string;
  name: string;
  // Its next date, for a reminder before each payment
  due: Date | null;
  frequency: PaymentFrequency;
}

interface NotePaymentAndReminderProps {
  draft: NoteDraftState;
  // The recurring payments a note can be about
  payments: NotePaymentOption[];
  today: Date;
}

/*
 * The payment a note is about, and its reminder: two separate things. Linking a payment only says
 * what the note is about. The reminder is off until added; with a payment linked it can be before
 * each of the payment's dates, or on a date of the note's own, which can repeat.
 */
export const NotePaymentAndReminder = ({ draft, payments, today }: NotePaymentAndReminderProps) => {
  // Asked for a reminder on a date that hasn't been picked yet
  const [adding, setAdding] = useState(false);
  const payment = payments.find(item => item.value === draft.paymentId);
  const follows = draft.repeat === 'WITH_PAYMENT' && !!payment;
  const reminding = follows || !!draft.date || adding;
  const choices = remindChoices({ repeat: draft.repeat, paymentFrequency: payment?.frequency });
  const hint = reminderHint(draft, {
    today,
    format: date => formatShortDate(date, today),
    paymentDue: payment?.due ?? null
  });

  // Changes that leave reminders too far apart for how often it comes round drop them
  const change = (changes: Partial<NoteDraft>) => {
    const next = { ...draft.draft, ...changes };
    const nextPayment = payments.find(item => item.value === next.paymentId);
    const allowed: readonly number[] = remindChoices({
      repeat: next.repeat,
      paymentFrequency: nextPayment?.frequency
    });
    for (const [key, value] of Object.entries(changes)) {
      draft.set(key as keyof NoteDraft, value as never);
    }
    const remind = next.remind.filter(days => allowed.includes(days));
    if (remind.length !== next.remind.length) draft.set('remind', remind);
  };

  const followPayment = (chosen: NotePaymentOption) => {
    const allowed = remindChoices({ repeat: 'WITH_PAYMENT', paymentFrequency: chosen.frequency });
    change({
      repeat: 'WITH_PAYMENT',
      date: '',
      remind: draft.remind.length ? draft.remind : defaultRemind(allowed)
    });
  };

  const choosePayment = (id: string) => {
    // A reminder before each payment moves to the next one's date when the payment goes
    if (follows && !id) {
      change({ paymentId: '', repeat: 'NONE', date: payment?.due ? toIsoDate(payment.due) : '' });
    } else {
      change({ paymentId: id });
    }
  };

  const addReminder = () => {
    if (payment) followPayment(payment);
    else setAdding(true);
  };

  const removeReminder = () => {
    setAdding(false);
    change({ repeat: 'NONE', date: '', remind: [] });
  };

  const chooseWhen = (when: ReminderWhen) => {
    if (!payment) return;
    if (when === 'payment') {
      followPayment(payment);
      return;
    }
    // On a date of its own, starting from the payment's next one
    setAdding(true);
    change({ repeat: 'NONE', date: payment.due ? toIsoDate(payment.due) : '' });
  };

  return (
    <>
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

      {reminding ? (
        <section
          aria-labelledby="note-reminder"
          className="flex flex-col gap-4 rounded-[22px] border border-border bg-surface-2 p-4">
          <div className="-my-1 flex items-center justify-between gap-3">
            <h3 id="note-reminder" className="text-[15px] font-bold">
              Reminder
            </h3>
            <IconButton
              aria-label="Take the reminder off"
              onClick={removeReminder}
              className="-mr-2">
              <X size={18} strokeWidth={2.25} aria-hidden="true" />
            </IconButton>
          </div>

          {payment ? (
            <div>
              <p id="note-when" className={fieldLabel}>
                When
              </p>
              <SegmentedControl<ReminderWhen>
                aria-labelledby="note-when"
                value={follows ? 'payment' : 'date'}
                onValueChange={chooseWhen}
                options={[
                  { value: 'payment', label: 'Before each payment' },
                  { value: 'date', label: 'On a date' }
                ]}
                size="lg"
                fullWidth
                className="[&>button]:max-md:px-2"
              />
            </div>
          ) : null}

          <div>
            {follows ? (
              <>
                <p id="note-date-label" className={fieldLabel}>
                  Date
                </p>
                {/* The payment's next date, which it moves on with */}
                <p
                  aria-labelledby="note-date-label"
                  className="flex min-h-12 items-center gap-2.5 rounded-2xl border border-accent bg-accent-soft px-4 py-2.5 text-[15px] leading-[1.3] font-bold">
                  <Repeat size={16} aria-hidden="true" className="shrink-0 text-accent-text" />
                  <span className="min-w-0">
                    {payment.due
                      ? `${formatShortDay(payment.due, { withYear: true })} · ${payment.name}’s next payment`
                      : `${payment.name} has no payments left`}
                  </span>
                </p>
              </>
            ) : (
              <>
                <label htmlFor="note-date" className={fieldLabel}>
                  Date
                </label>
                <DatePicker
                  id="note-date"
                  value={draft.date}
                  onChange={date => draft.set('date', date)}
                  placeholder="Choose a date"
                  className={cn(
                    draft.date && 'border-accent bg-accent-soft font-bold [&>svg]:text-accent-text'
                  )}
                />
              </>
            )}
          </div>

          {follows || draft.date ? (
            <div>
              <p id="note-remind" className={fieldLabel}>
                Remind me
              </p>
              <ChipGroup
                type="multiple"
                aria-labelledby="note-remind"
                value={draft.remind.map(String)}
                onValueChange={values => draft.set('remind', values.map(Number))}
                options={choices.map(days => ({
                  value: String(days),
                  label: daysBeforeText(days)
                }))}
                className="[&>button]:max-md:px-3"
              />
            </div>
          ) : null}

          {!follows && draft.date ? (
            <div>
              <p id="note-repeat" className={fieldLabel}>
                Repeat
              </p>
              <ChipGroup
                type="single"
                aria-labelledby="note-repeat"
                value={draft.repeat === 'WITH_PAYMENT' ? 'NONE' : draft.repeat}
                onValueChange={repeat => change({ repeat })}
                options={REPEATS.map(value => ({ value, label: REPEAT_LABELS[value] }))}
                className="[&>button]:max-md:px-3"
              />
            </div>
          ) : null}

          {hint ? (
            <p
              aria-live="polite"
              className="-mt-1 ml-1 text-xs leading-[1.4] font-semibold text-muted">
              {hint}
            </p>
          ) : null}
        </section>
      ) : (
        <div className="flex items-center gap-3 rounded-[22px] border border-border bg-surface-2 py-3 pr-3 pl-4">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">Reminder</p>
            <p className="text-[13px] font-medium text-muted">
              {payment
                ? `Before each ${payment.name} payment, or on a date`
                : 'Before a date, like an MOT'}
            </p>
          </div>
          <Button onClick={addReminder} className="shrink-0 font-bold">
            <Bell size={16} aria-hidden="true" />
            Add a reminder
          </Button>
        </div>
      )}
    </>
  );
};
