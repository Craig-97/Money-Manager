import { Payment, paymentLetter } from '~/lib/payments';
import {
  AmountInput,
  DatePicker,
  FieldError,
  Label,
  LogoField,
  Select,
  TextInput
} from '../../../../form';
import { MoreOptions } from '../../../../ui';
import { categoryOptions, FREQUENCY_OPTIONS } from '../../paymentOptions';
import { PaymentForm } from '../../usePaymentForm';
import { DebtFields } from '../DebtFields';
import { FromAccount } from '../FromAccount';
import { NonWorkingDayField } from '../NonWorkingDayField';
import { PaymentTypeToggle } from '../PaymentTypeToggle';
import { RecurringEnding } from '../RecurringEnding';
import { ReminderFields } from '../ReminderFields';
import { RoleChoice } from '../RoleChoice';
import { ScheduleSummary } from '../ScheduleSummary';

// Side by side on a phone too, as each half is short
const pairClasses = 'grid grid-cols-2 gap-2.5 md:gap-3.5';
// The name gets the wider part
const nameAmountClasses =
  'grid gap-[inherit] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-3.5';

/*
 * The payment's fields: name and amount, type and category, then for a recurring expense what it
 * is (a payment, a debt or money moving to another account) with that choice's own fields, then
 * its date or schedule. What most people leave alone, its logo, which account and the reminders, is
 * under More options.
 */
export const FormBody = ({ form, kind }: { form: PaymentForm; kind: Payment['kind'] }) => {
  const { values, set, touch, errors } = form;
  const recurring = kind === 'recurring';
  const debt = recurring && form.role === 'debt';
  const categoryField = (
    <div>
      <Label tone="muted" htmlFor="payment-category">
        Category
      </Label>
      <Select
        id="payment-category"
        value={values.category}
        onValueChange={category => set('category', category)}
        options={categoryOptions(values.type, values.category)}
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
              debt ? 'e.g. Credit card' : recurring ? 'e.g. Car insurance' : 'e.g. Concert tickets'
            }
            autoComplete="off"
            invalid={!!errors.name}
            aria-describedby={errors.name ? 'payment-name-error' : undefined}
          />
          {errors.name ? <FieldError id="payment-name-error">{errors.name}</FieldError> : null}
        </div>
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
          {errors.amount ? (
            <FieldError id="payment-amount-error">{errors.amount}</FieldError>
          ) : null}
        </div>
      </div>

      {/* A debt is always money out, so it has no type to choose */}
      {debt ? (
        categoryField
      ) : (
        <div className={pairClasses}>
          <PaymentTypeToggle value={values.type} onChange={type => set('type', type)} />
          {categoryField}
        </div>
      )}

      {/* Opened from Debts it's always a debt, so there's nothing to choose */}
      {recurring && form.asDebt ? <DebtFields form={form} /> : null}
      {recurring && !form.asDebt && values.type === 'EXPENSE' ? <RoleChoice form={form} /> : null}

      {kind === 'oneOff' ? (
        <div>
          <Label tone="muted" htmlFor="payment-date">
            Due date
          </Label>
          <DatePicker id="payment-date" value={values.date} onChange={date => set('date', date)} />
        </div>
      ) : (
        <>
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
          {/* A debt ends when it's paid off; its summary says when */}
          {debt ? <ScheduleSummary text={form.summary} /> : <RecurringEnding form={form} />}
        </>
      )}

      <MoreOptions
        summary={form.more.summary}
        open={form.more.open}
        onOpenChange={form.more.setOpen}>
        {form.showLogo ? (
          <LogoField
            id="payment-logo"
            letter={paymentLetter(values.name)}
            value={values.logo}
            onChange={logo => set('logo', logo)}
            example="netflix.com"
            error={errors.logo}
          />
        ) : null}
        {form.choices.several ? <FromAccount form={form} /> : null}
        <NonWorkingDayField form={form} />
        <ReminderFields form={form} />
      </MoreOptions>
    </>
  );
};
