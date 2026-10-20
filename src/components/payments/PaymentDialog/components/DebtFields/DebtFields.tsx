import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { TextInput } from '~/components/form/TextInput';
import { PaymentForm } from '../../usePaymentForm';

// The debt's inputs sit on the surface colour, inside the tinted debt card
const boxClasses = 'bg-surface';

/*
 * What's owed, its rate and what was borrowed, inside the debt card: the balance across the top,
 * the other two side by side under it. The payoff date is worked out from them.
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
          boxClassName={boxClasses}
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
              boxClassName={boxClasses}
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
              boxClassName={boxClasses}
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
        <p
          id="payment-started-hint"
          className="mt-2 ml-1 text-xs leading-[1.45] font-semibold text-muted">
          What you owed at the start, so Debts can show how far you’ve come.
        </p>
      </div>
    </>
  );
};
