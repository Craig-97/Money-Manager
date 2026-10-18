import { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { DatePicker } from '~/components/form/DatePicker';
import { Select } from '~/components/form/Select';
import { Button } from '~/components/ui/Button';
import { ChipGroup } from '~/components/ui/ChipGroup';
import { IconButton } from '~/components/ui/IconButton';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { NoteRepeat } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { NOTE_REMIND_DAYS, reminderHint } from '~/lib/notes';
import { daysBeforeText, formatShortDate } from '~/lib/payments';
import { NoteDraftState } from '../../useNoteDraft';

// Radix's select can't have an empty value, so no payment is this
const NO_PAYMENT = 'none';

const REMIND_OPTIONS = NOTE_REMIND_DAYS.map(days => ({
  value: String(days),
  label: daysBeforeText(days)
}));

const REPEAT_OPTIONS: { value: NoteRepeat; label: string }[] = [
  { value: 'NONE', label: 'Just once' },
  { value: 'YEARLY', label: 'Every year' }
];

interface NoteDateFieldsProps {
  draft: NoteDraftState;
  // The payments a note can be about
  payments: { value: string; label: string }[];
  today: Date;
}

/*
 * A note's date, when to be reminded before it, whether it comes round every year, and the
 * payment it's about. Without a date it's one row offering to add one, so a plain note stays
 * short; adding one opens the calendar and the rest.
 */
export const NoteDateFields = ({ draft, payments, today }: NoteDateFieldsProps) => {
  // Asked to add a date, so the calendar shows before one is picked
  const [adding, setAdding] = useState(false);
  const hint = reminderHint(draft, { today, format: date => formatShortDate(date, today) });

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

  return (
    <div className="flex flex-col gap-4 rounded-[22px] border border-border bg-surface-2 p-4">
      <div>
        <label htmlFor="note-date" className="mb-2 block text-[13px] font-bold text-muted">
          Date
        </label>
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
      </div>

      {draft.date ? (
        <>
          <div>
            <p id="note-remind" className="mb-2 text-[13px] font-bold text-muted">
              Remind me
            </p>
            <ChipGroup
              type="multiple"
              aria-labelledby="note-remind"
              value={draft.remind.map(String)}
              onValueChange={values => draft.set('remind', values.map(Number))}
              options={REMIND_OPTIONS}
              className="[&>button]:max-md:px-3"
            />
          </div>
          <div>
            <p id="note-repeat" className="mb-2 text-[13px] font-bold text-muted">
              Repeat
            </p>
            <SegmentedControl
              aria-labelledby="note-repeat"
              value={draft.repeat}
              onValueChange={repeat => draft.set('repeat', repeat)}
              options={REPEAT_OPTIONS}
              size="lg"
              fullWidth
            />
          </div>
        </>
      ) : null}

      {payments.length && (draft.date || draft.paymentId) ? (
        <div>
          <label htmlFor="note-payment" className="mb-2 block text-[13px] font-bold text-muted">
            Payment
          </label>
          <Select
            id="note-payment"
            value={draft.paymentId || NO_PAYMENT}
            onValueChange={id => draft.set('paymentId', id === NO_PAYMENT ? '' : id)}
            options={[{ value: NO_PAYMENT, label: 'Not about a payment' }, ...payments]}
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
