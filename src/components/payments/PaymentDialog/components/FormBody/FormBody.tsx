import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Payment } from '~/lib/payments';
import { FREQUENCY_OPTIONS, ONE_OFF_OPTIONS, RECURRING_OPTIONS } from '../../paymentOptions';
import { PaymentForm } from '../../usePaymentForm';
import { PaymentTypeToggle } from '../PaymentTypeToggle';
import { RecurringEnding } from '../RecurringEnding';

const pairClasses = 'grid gap-3.5 max-md:grid-cols-2 max-md:gap-2.5 min-[35rem]:grid-cols-2';

/* The payment's fields: type, name, amount and category, then its date or schedule */
export const FormBody = ({ form, kind }: { form: PaymentForm; kind: Payment['kind'] }) => {
  const { values, set, touch, errors } = form;
  const amountField = (
    <div>
      <Label tone="muted" htmlFor="payment-amount">
        Amount
      </Label>
      <AmountInput
        id="payment-amount"
        value={values.amount}
        onChange={event => set('amount', event.target.value)}
        onBlur={() => touch('amount')}
        placeholder="0.00"
        invalid={!!errors.amount}
        aria-describedby={errors.amount ? 'payment-amount-error' : undefined}
      />
      {errors.amount ? <FieldError id="payment-amount-error">{errors.amount}</FieldError> : null}
    </div>
  );
  // Recurring payments ask for it straight after the amount, one-offs at the end
  const categoryField = (
    <div>
      <Label tone="muted" htmlFor="payment-category">
        Category
      </Label>
      <Select
        id="payment-category"
        value={values.category}
        onValueChange={category => set('category', category)}
        options={kind === 'recurring' ? RECURRING_OPTIONS : ONE_OFF_OPTIONS}
      />
    </div>
  );

  return (
    <>
      <PaymentTypeToggle value={values.type} onChange={type => set('type', type)} />

      <div>
        <Label tone="muted" htmlFor="payment-name">
          Name
        </Label>
        <TextInput
          id="payment-name"
          value={values.name}
          onChange={event => set('name', event.target.value)}
          onBlur={() => touch('name')}
          placeholder={kind === 'recurring' ? 'e.g. Spotify' : 'e.g. Concert tickets'}
          autoComplete="off"
          invalid={!!errors.name}
          aria-describedby={errors.name ? 'payment-name-error' : undefined}
        />
        {errors.name ? <FieldError id="payment-name-error">{errors.name}</FieldError> : null}
      </div>

      {kind === 'oneOff' ? (
        <>
          <div className={pairClasses}>
            {amountField}
            <div>
              <Label tone="muted" htmlFor="payment-date">
                Due date
              </Label>
              <DatePicker
                id="payment-date"
                value={values.date}
                onChange={date => set('date', date)}
              />
            </div>
          </div>
          {categoryField}
        </>
      ) : (
        <>
          {amountField}
          {categoryField}
          <div className={pairClasses}>
            <div>
              <Label tone="muted" htmlFor="payment-frequency">
                Repeats
              </Label>
              <Select
                id="payment-frequency"
                value={values.frequency}
                onValueChange={frequency => set('frequency', frequency)}
                options={FREQUENCY_OPTIONS}
              />
            </div>
            <div>
              <Label tone="muted" htmlFor="payment-first">
                First payment
              </Label>
              <DatePicker
                id="payment-first"
                value={values.first}
                onChange={first => set('first', first)}
              />
            </div>
          </div>
          <RecurringEnding form={form} />
        </>
      )}
    </>
  );
};
