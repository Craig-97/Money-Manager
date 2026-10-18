import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { TextInput } from '~/components/form/TextInput';
import { PaymentForm } from '../../usePaymentForm';
import { ScheduleSummary } from '../ScheduleSummary';

// The debt's inputs sit on the surface colour, inside the tinted details box
const boxClasses = 'bg-surface';

/*
 * In place of Ends for a debt: it ends when it's paid off, worked out from the balance and APR
 * filled in here. Then the schedule summary, with the payoff date.
 */
export const DebtFields = ({ form }: { form: PaymentForm }) => {
  const { values, set, touch, errors, summary } = form;

  return (
    <>
      <div>
        <p className="mb-2 text-[13px] font-bold text-muted">Ends</p>
        <p className="flex min-h-12 items-center rounded-2xl border border-border bg-surface-2 px-4 text-sm font-bold">
          When it&rsquo;s paid off
        </p>
        <p className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">
          Worked out from the balance and APR below. Nothing is due once it reaches £0.
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="payment-debt-details"
        className="flex flex-col gap-3.5 rounded-[22px] border border-accent bg-surface-2 p-3.5">
        <div className="flex flex-col gap-0.5">
          <span id="payment-debt-details" className="text-[15px] font-bold">
            Debt details
          </span>
          <span className="text-xs font-semibold text-muted">
            Used for the payoff date on Debts
          </span>
        </div>

        <div>
          <Label tone="muted" htmlFor="payment-balance">
            Balance now
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

        <div className="grid grid-cols-2 gap-2.5 md:gap-3.5">
          <div>
            <Label tone="muted" htmlFor="payment-apr">
              APR
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
              Started at
            </Label>
            <AmountInput
              id="payment-started"
              value={values.started}
              onChange={event => set('started', event.target.value)}
              onBlur={() => touch('started')}
              placeholder="Optional"
              boxClassName={boxClasses}
              invalid={!!errors.started}
              aria-describedby={errors.started ? 'payment-started-error' : undefined}
            />
            {errors.started ? (
              <FieldError id="payment-started-error">{errors.started}</FieldError>
            ) : null}
          </div>
        </div>
      </div>

      <ScheduleSummary rows={summary.rows} message={summary.message} />
    </>
  );
};
