import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { parseIsoDate } from '~/lib/dates';
import { toReminderDays } from '~/lib/payments';
import { ENDS_OPTIONS, REMINDER_OPTIONS } from '../../paymentOptions';
import { PaymentForm } from '../../usePaymentForm';
import { RenewalPrompt } from '../RenewalPrompt';
import { ScheduleSummary } from '../ScheduleSummary';

/* Ends: keeps going, renews on a date, or stops after a last payment, plus the schedule summary */
export const RecurringEnding = ({ form }: { form: PaymentForm }) => {
  const { values, set, errors, ending, summary } = form;
  const { ends, yearly, reminds, reminder } = ending;
  const renewal = parseIsoDate(values.renewal);

  return (
    <>
      <div>
        <p id="payment-ends" className="mb-2 text-[13px] font-bold text-muted">
          Ends
        </p>
        <SegmentedControl
          aria-labelledby="payment-ends"
          value={ends}
          onValueChange={value => set('ends', value)}
          // Yearly payments renew with each payment, so they only keep going or stop
          options={yearly ? ENDS_OPTIONS.filter(option => option.value !== 'renew') : ENDS_OPTIONS}
          size="lg"
          fullWidth
        />
        <p className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">{form.endsHint}</p>
      </div>

      {ends === 'stop' ? (
        <div>
          <Label tone="muted" htmlFor="payment-end">
            Last payment
          </Label>
          <DatePicker
            id="payment-end"
            value={values.end}
            onChange={end => set('end', end)}
            min={values.first}
            invalid={!!errors.end}
            aria-describedby={errors.end ? 'payment-end-error' : undefined}
          />
          {errors.end ? <FieldError id="payment-end-error">{errors.end}</FieldError> : null}
        </div>
      ) : null}

      {ends === 'renew' && form.renewalPassed && renewal ? (
        <RenewalPrompt
          renewedOn={renewal}
          onSetNext={form.setNextRenewal}
          onStop={form.stopAtRenewal}
        />
      ) : null}

      {ends === 'renew' && !form.renewalPassed ? (
        <div>
          <Label tone="muted" htmlFor="payment-renewal">
            Renews on
          </Label>
          <DatePicker
            id="payment-renewal"
            value={values.renewal}
            onChange={date => set('renewal', date)}
            invalid={!!errors.renewal}
            aria-describedby={errors.renewal ? 'payment-renewal-error' : undefined}
          />
          {errors.renewal ? (
            <FieldError id="payment-renewal-error">{errors.renewal}</FieldError>
          ) : null}
        </div>
      ) : null}

      {reminds && !form.renewalPassed ? (
        <div>
          <p id="payment-reminder" className="mb-2 text-[13px] font-bold text-muted">
            Remind me before it renews
          </p>
          <SegmentedControl
            aria-labelledby="payment-reminder"
            value={String(reminder)}
            onValueChange={value => set('reminder', toReminderDays(Number(value)))}
            options={REMINDER_OPTIONS}
            size="lg"
            fullWidth
          />
        </div>
      ) : null}

      <ScheduleSummary rows={summary.rows} message={summary.message} />
      {form.renewalMoved ? (
        <p className="-mt-1.5 ml-1 text-xs font-semibold text-muted">
          Check the amount above is your new price.
        </p>
      ) : null}
    </>
  );
};
