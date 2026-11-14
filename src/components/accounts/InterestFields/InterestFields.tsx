import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { InterestFrequency } from '~/graphql/generated';
import { FREQUENCY_NAMES, interestPerPayment, nextMonthlyInterest } from '~/lib/accounts';
import { addDays, formatShortDate, parseIsoDate, toApiDate } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { InterestDraft, InterestDraftErrors } from '../accountDraft';

// A select can't hold an empty value, so not said yet has one of its own
const NOT_SET = 'NOT_SET';
type FrequencyChoice = InterestFrequency | typeof NOT_SET;

const OPTIONS: { value: FrequencyChoice; label: string }[] = [
  { value: NOT_SET, label: 'Not set' },
  ...(Object.keys(FREQUENCY_NAMES) as InterestFrequency[]).map(value => ({
    value,
    label: FREQUENCY_NAMES[value]
  }))
];

const THEN: Record<InterestFrequency, string> = {
  MONTHLY: 'then each month',
  QUARTERLY: 'then every 3 months',
  YEARLY: 'then each year',
  MATURITY: 'when it matures'
};

interface InterestFieldsProps {
  draft: InterestDraft;
  set: (fields: Partial<InterestDraft>) => void;
  errors: InterestDraftErrors;
  // What the estimate is worked out on
  balance: number | null;
  today: Date;
}

// The one sentence wherever interest is set up
const HOW_IT_WORKS =
  'Worked out on each day’s balance and added on the day it’s paid. If your bank pays a different amount, update the balance.';

/*
 * A savings account's interest: its rate (AER), how often it's paid, then the day of the month or
 * the next date. With those, what the next payment should be, worked out on each day's balance.
 * Three across on desktop; on a phone the day or date goes under the other two.
 */
export const InterestFields = ({ draft, set, errors, balance, today }: InterestFieldsProps) => {
  const frequency = draft.frequency || null;
  const rate = Number(draft.rate.replace(/[%\s]/g, ''));
  const day = Number(draft.day.trim());
  const next =
    frequency === 'MONTHLY'
      ? Number.isInteger(day) && day >= 1 && day <= 31
        ? nextMonthlyInterest(day, today)
        : null
      : parseIsoDate(draft.nextDate);
  const estimate =
    frequency && draft.rate.trim() && Number.isFinite(rate) && balance !== null && next
      ? `About ${formatMoney(interestPerPayment(balance, { rate, frequency }))} on ${formatShortDate(next, today)}, ${THEN[frequency]}.`
      : null;
  const whenField =
    frequency === 'MONTHLY' ? (
      <div>
        <Label tone="muted" htmlFor="account-interest-day">
          Day of the month
        </Label>
        <TextInput
          id="account-interest-day"
          inputMode="numeric"
          value={draft.day}
          onChange={event => set({ day: event.target.value })}
          placeholder="e.g. 3"
          autoComplete="off"
          className="font-extrabold"
          invalid={!!errors.day}
          aria-describedby={errors.day ? 'account-interest-day-error' : undefined}
        />
        {errors.day ? <FieldError id="account-interest-day-error">{errors.day}</FieldError> : null}
      </div>
    ) : frequency ? (
      <div>
        <Label tone="muted" htmlFor="account-interest-date">
          {frequency === 'MATURITY' ? 'Matures on' : 'Next paid on'}
        </Label>
        <DatePicker
          id="account-interest-date"
          value={draft.nextDate}
          onChange={nextDate => set({ nextDate })}
          min={toApiDate(addDays(today, 1))}
          invalid={!!errors.nextDate}
          aria-describedby={errors.nextDate ? 'account-interest-date-error' : undefined}
        />
        {errors.nextDate ? (
          <FieldError id="account-interest-date-error">{errors.nextDate}</FieldError>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,1fr)] md:items-start md:gap-3.5">
        <div>
          <Label tone="muted" htmlFor="account-rate">
            Rate (AER)
          </Label>
          <TextInput
            id="account-rate"
            inputMode="decimal"
            value={draft.rate}
            onChange={event => set({ rate: event.target.value })}
            placeholder="0.0"
            autoComplete="off"
            className="font-extrabold"
            suffix={<span className="pr-1 font-bold text-muted">%</span>}
            invalid={!!errors.rate}
            aria-describedby={errors.rate ? 'account-rate-error' : undefined}
          />
          {errors.rate ? <FieldError id="account-rate-error">{errors.rate}</FieldError> : null}
        </div>
        <div>
          <Label tone="muted" htmlFor="account-interest-paid">
            Paid
          </Label>
          <Select
            id="account-interest-paid"
            value={draft.frequency || NOT_SET}
            onValueChange={choice => set({ frequency: choice === NOT_SET ? '' : choice })}
            options={OPTIONS}
          />
        </div>
        {whenField ? <div className="max-md:col-span-1">{whenField}</div> : null}
      </div>
      <p className="ml-1 text-xs leading-[1.4] font-semibold text-muted">
        {estimate ? (
          <>
            <span className="font-bold text-text">{estimate}</span> {HOW_IT_WORKS}
          </>
        ) : frequency ? (
          'Say when it’s paid to see what it should be.'
        ) : (
          `Optional. Say when it’s paid. ${HOW_IT_WORKS}`
        )}
      </p>
    </div>
  );
};
