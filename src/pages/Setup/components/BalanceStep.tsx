import { RotateCcw } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { cn } from '~/lib/cn';
import { SetupState } from '../hooks';
import { helpClasses, questionClasses, stepCardClasses } from './setupClasses';

/* Step 2: what's in the bank today */
export const BalanceStep = ({ setup, error }: { setup: SetupState; error?: string }) => (
  <section className={cn(stepCardClasses, 'flex flex-col gap-[18px] p-6')}>
    <div>
      <label htmlFor="setup-balance" className={questionClasses}>
        Current bank balance
      </label>
      <AmountInput
        id="setup-balance"
        size="hero"
        value={setup.values.balance}
        onChange={event => setup.update('balance', event.target.value)}
        invalid={!!error}
        aria-describedby={error ? 'setup-balance-error setup-balance-help' : 'setup-balance-help'}
      />
      {error ? <FieldError id="setup-balance-error">{error}</FieldError> : null}
      <p id="setup-balance-help" className={helpClasses}>
        Include today's pay if it has already arrived.
      </p>
    </div>
    <div className="flex items-start gap-3 rounded-[20px] border border-border bg-surface-2 px-4 py-3.5">
      <RotateCcw size={18} className="mt-px shrink-0 text-accent-text" aria-hidden="true" />
      <p className="text-[13px] leading-normal text-muted">
        Every payday we'll ask you to confirm this number, so small differences don't build up over
        time.
      </p>
    </div>
  </section>
);
