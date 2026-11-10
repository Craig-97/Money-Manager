import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { PaymentForm } from '../../usePaymentForm';

/*
 * When a date on a weekend or bank holiday goes out, for a recurring payment. Under More options:
 * most follow the usual choice from Profile. The hint says what happens to the next such date.
 */
export const NonWorkingDayField = ({ form }: { form: PaymentForm }) => {
  if (!form.nonWorkingDay) return null;
  const { options, hint } = form.nonWorkingDay;

  return (
    <div>
      <Label tone="muted" htmlFor="payment-non-working-day">
        On a weekend or bank holiday
      </Label>
      <Select
        id="payment-non-working-day"
        value={form.values.nonWorkingDay}
        onValueChange={value => form.set('nonWorkingDay', value)}
        options={options}
        aria-describedby="payment-non-working-day-hint"
        className="bg-surface"
      />
      <p
        id="payment-non-working-day-hint"
        className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">
        {hint}
      </p>
    </div>
  );
};
