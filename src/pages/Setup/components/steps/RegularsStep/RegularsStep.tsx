import { Check, Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { formatMoney, formatPayment } from '~/lib/format';
import { SetupState } from '../../../hooks';
import { PRESETS, setupAccounts } from '../../../setupModel';
import { regularDetails } from '../../../setupPayments';
import { questionClasses, stepCardClasses } from '../setupClasses';
import { SetupRow } from '../SetupRow';

interface RegularsStepProps {
  setup: SetupState;
  // Recurring money out a month, and the yearly and 6-monthly payments kept apart from it
  monthlyTotal: number;
  yearlyTotal: number;
  today: Date;
}

/*
 * Step 3: bills, subscriptions and regular income. A suggestion opens the payment form with its
 * name and category filled in; each payment in the list opens it again to change.
 */
export const RegularsStep = ({ setup, monthlyTotal, yearlyTotal, today }: RegularsStepProps) => {
  const { values } = setup;
  const accounts = setupAccounts(values);

  return (
    <section className="flex flex-col gap-5">
      <div className={cn(stepCardClasses, 'px-[22px] py-5')}>
        <p id="setup-presets" className={questionClasses}>
          Suggestions
        </p>
        <div role="group" aria-labelledby="setup-presets" className="flex flex-wrap gap-2">
          {PRESETS.map(preset => {
            const added = values.regulars.some(regular => regular.preset === preset.key);
            return (
              <button
                key={preset.key}
                type="button"
                aria-pressed={added}
                aria-haspopup="dialog"
                onClick={() => setup.openPreset(preset.key)}
                className={cn(
                  'inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-border bg-surface-2 pr-4 pl-3 text-sm font-bold transition-colors hover:bg-hover',
                  added && 'border-accent bg-accent-soft'
                )}>
                {added ? (
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className="text-accent-text"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus size={16} strokeWidth={2.25} className="text-muted" aria-hidden="true" />
                )}
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-base font-extrabold">
          Your regular payments <span className="num text-muted">({values.regulars.length})</span>
        </h2>
        <p className="text-[13px] text-muted">
          <span className="num font-extrabold text-expense">{formatMoney(monthlyTotal)}</span> a
          month going out
          {yearlyTotal > 0 ? (
            <>
              {' '}
              + <span className="num font-extrabold">{formatMoney(yearlyTotal)}</span> a year
            </>
          ) : null}
        </p>
      </div>

      {values.regulars.length === 0 ? (
        <p className="rounded-[22px] border border-dashed border-border-strong p-7 text-center text-sm text-muted">
          No regular payments yet. Tap a suggestion above or add your own.
        </p>
      ) : (
        <div className={cn(stepCardClasses, 'p-1.5')}>
          {values.regulars.map(regular => (
            <SetupRow
              key={regular.id}
              name={regular.input.name}
              details={regularDetails(regular, { accounts, today })}
              amount={formatPayment(
                regular.input.type === 'INCOME' ? regular.input.amount : -regular.input.amount
              )}
              tone={regular.input.type === 'INCOME' ? 'income' : 'expense'}
              onOpen={() => setup.openPayment({ kind: 'recurring', id: regular.id })}
              onRemove={() => setup.payment.remove(regular.id)}
            />
          ))}
        </div>
      )}

      <Button
        size="lg"
        onClick={() => setup.openPayment({ kind: 'recurring' })}
        className="self-start border-dashed font-bold">
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
        Add custom payment
      </Button>
    </section>
  );
};
