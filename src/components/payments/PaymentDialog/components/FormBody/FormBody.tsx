import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Payment } from '~/lib/payments';
import { FREQUENCY_OPTIONS, ONE_OFF_OPTIONS, RECURRING_OPTIONS } from '../../paymentOptions';
import { PaymentForm } from '../../usePaymentForm';
import { DebtEnding } from '../DebtEnding';
import { FromAccount } from '../FromAccount';
import { PaymentTypeToggle } from '../PaymentTypeToggle';
import { PaysInto } from '../PaysInto';
import { RecurringEnding } from '../RecurringEnding';
import { TrackAsDebt } from '../TrackAsDebt';

const pairClasses = 'grid gap-3.5 max-md:grid-cols-2 max-md:gap-2.5 min-[35rem]:grid-cols-2';
// Side by side in the desktop dialog only; the mobile sheet stacks them
const desktopPairClasses = 'grid gap-[inherit] md:grid-cols-2 md:gap-3.5';
// The name gets the wider part
const nameAmountClasses =
  'grid gap-[inherit] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-3.5';

/*
 * The payment's fields: name and amount, type and category, then its date or schedule. On desktop
 * each pair shares a row, so the dialog isn't so tall. With more than one account to spend from,
 * it says which one it goes out of (or an income lands in). A recurring expense can be tracked as
 * a debt, with its balance and rate in the switch's card, which is always money out and ends when
 * it's paid off, or move money into another of the budget's accounts, but not both.
 */
export const FormBody = ({ form, kind }: { form: PaymentForm; kind: Payment['kind'] }) => {
  const { values, set, touch, errors } = form;
  const debt = kind === 'recurring' && values.tracked;
  // A recurring expense can move money into another account, like a standing order; it's then
  // not a debt
  const paysInto = kind === 'recurring' && !!form.choices.into;
  const canPayInto =
    kind === 'recurring' &&
    !form.asDebt &&
    values.type === 'EXPENSE' &&
    !debt &&
    form.choices.targets.length > 0;
  // From Debts it's always a debt; otherwise only an expense can be one, and not one into savings
  const canTrack =
    kind === 'recurring' && (form.asDebt || (!paysInto && (values.type === 'EXPENSE' || debt)));
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
      <div className={nameAmountClasses}>
        <div>
          <Label tone="muted" htmlFor="payment-name">
            Name
          </Label>
          <TextInput
            id="payment-name"
            value={values.name}
            onChange={event => set('name', event.target.value)}
            onBlur={() => touch('name')}
            placeholder={
              debt
                ? 'e.g. Credit card'
                : kind === 'recurring'
                  ? 'e.g. Car insurance'
                  : 'e.g. Concert tickets'
            }
            autoComplete="off"
            invalid={!!errors.name}
            aria-describedby={errors.name ? 'payment-name-error' : undefined}
          />
          {errors.name ? <FieldError id="payment-name-error">{errors.name}</FieldError> : null}
        </div>
        {amountField}
      </div>

      {debt ? (
        categoryField
      ) : (
        <div className={desktopPairClasses}>
          <PaymentTypeToggle value={values.type} onChange={type => set('type', type)} />
          {categoryField}
        </div>
      )}

      {form.choices.several ? <FromAccount form={form} /> : null}

      {kind === 'oneOff' ? (
        <div className={desktopPairClasses}>
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
          <div>
            <Label tone="muted" htmlFor="payment-due-reminder">
              Remind me before it’s due
            </Label>
            <Select
              id="payment-due-reminder"
              value={values.dueReminder}
              onValueChange={value => set('dueReminder', value)}
              options={form.reminderOptions.due}
            />
          </div>
        </div>
      ) : (
        <>
          {canTrack ? <TrackAsDebt form={form} /> : null}
          {canPayInto ? <PaysInto form={form} /> : null}
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
          {debt ? <DebtEnding form={form} /> : <RecurringEnding form={form} />}
        </>
      )}
    </>
  );
};
