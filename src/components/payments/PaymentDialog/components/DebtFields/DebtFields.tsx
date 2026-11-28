import { AmountInput, DatePicker, FieldError, FieldHint, Label, TextInput } from '../../../../form';
import { PaymentForm } from '../../usePaymentForm';

/*
 * What's owed, its rate and what was borrowed, under the Debt choice: the balance across the top,
 * the other two side by side under it, then when its rate ends. The payoff date is worked out from
 * them.
 */
export const DebtFields = ({ form }: { form: PaymentForm }) => {
  const { values, set, touch, errors } = form;

  return (
    <>
      <div>
        <Label tone="muted" htmlFor="payment-balance">
          Balance left
        </Label>
        <AmountInput
          id="payment-balance"
          value={values.balance}
          onChange={event => set('balance', event.target.value)}
          onBlur={() => touch('balance')}
          placeholder="0.00"
          invalid={!!errors.balance}
          aria-describedby={errors.balance ? 'payment-balance-error' : undefined}
        />
        {errors.balance ? (
          <FieldError id="payment-balance-error">{errors.balance}</FieldError>
        ) : null}
      </div>

      <div>
        <div className="grid grid-cols-2 gap-2.5 md:gap-3.5">
          <div>
            <Label tone="muted" htmlFor="payment-apr">
              Interest (APR)
            </Label>
            <TextInput
              id="payment-apr"
              value={values.apr}
              onChange={event => set('apr', event.target.value)}
              onBlur={() => touch('apr')}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.0"
              className='[font-feature-settings:"tnum"] font-extrabold'
              suffix={
                <span aria-hidden="true" className="font-extrabold text-muted">
                  %
                </span>
              }
              invalid={!!errors.apr}
              aria-describedby={errors.apr ? 'payment-apr-error' : undefined}
            />
            {errors.apr ? <FieldError id="payment-apr-error">{errors.apr}</FieldError> : null}
          </div>
          <div>
            <Label tone="muted" htmlFor="payment-started">
              Starting balance
            </Label>
            <AmountInput
              id="payment-started"
              value={values.started}
              onChange={event => set('started', event.target.value)}
              onBlur={() => touch('started')}
              placeholder="Optional"
              invalid={!!errors.started}
              aria-describedby={
                errors.started
                  ? 'payment-started-error payment-started-hint'
                  : 'payment-started-hint'
              }
            />
            {errors.started ? (
              <FieldError id="payment-started-error">{errors.started}</FieldError>
            ) : null}
          </div>
        </div>
        <FieldHint id="payment-started-hint">
          What you owed at the start, so Debts can show how far you’ve come.
        </FieldHint>
      </div>

      <div>
        <Label tone="muted" htmlFor="payment-rate-ends">
          Rate ends
        </Label>
        <DatePicker
          id="payment-rate-ends"
          value={values.rateEnds}
          onChange={date => set('rateEnds', date)}
          onClear={() => set('rateEnds', '')}
          placeholder="Optional"
          aria-describedby="payment-rate-ends-hint"
        />
        <FieldHint id="payment-rate-ends-hint">
          When a fixed or offer rate ends, like a mortgage fix or a 0% card. You’ll get a reminder
          before.
        </FieldHint>
      </div>
    </>
  );
};
