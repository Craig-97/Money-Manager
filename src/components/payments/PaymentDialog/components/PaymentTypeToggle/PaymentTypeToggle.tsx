import { PaymentType } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { TYPES } from '../../paymentOptions';

interface PaymentTypeToggleProps {
  value: PaymentType;
  onChange: (type: PaymentType) => void;
}

/* Expense or income, with a coloured dot for which way the money goes */
export const PaymentTypeToggle = ({ value, onChange }: PaymentTypeToggleProps) => (
  <div>
    <p id="payment-type" className="mb-2 text-[13px] font-bold text-muted">
      Type
    </p>
    <div
      role="group"
      aria-labelledby="payment-type"
      className="flex gap-0.5 rounded-full border border-border bg-surface-2 p-1">
      {TYPES.map(type => (
        <button
          key={type.value}
          type="button"
          aria-pressed={value === type.value}
          onClick={() => onChange(type.value)}
          className="group inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-muted hover:text-text aria-pressed:bg-pill-active-bg aria-pressed:text-pill-active-text max-md:h-11 max-md:text-[13px]">
          <span
            aria-hidden="true"
            className={cn('mr-2 size-2 rounded-full bg-faint', value === type.value && type.dot)}
          />
          {type.label}
        </button>
      ))}
    </div>
  </div>
);
