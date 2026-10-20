import { Check, Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { formatMoney, MINUS } from '~/lib/format';
import { SetupState, useSetupDesktop } from '../../../hooks';
import { PRESETS, setupAccounts } from '../../../setupModel';
import { regularDetails, regularNext } from '../../../setupPayments';
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
  const isDesktop = useSetupDesktop();
  const { values } = setup;
  const accounts = setupAccounts(values);

  const suggestions = (
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
              <Check size={16} strokeWidth={2.5} className="text-accent-text" aria-hidden="true" />
            ) : (
              <Plus size={16} strokeWidth={2.25} className="text-muted" aria-hidden="true" />
            )}
            {preset.name}
          </button>
        );
      })}
    </div>
  );

  const yearly =
    yearlyTotal > 0 ? (
      <>
        {' '}
        + <span className="num font-extrabold">{formatMoney(yearlyTotal)}</span> a year
      </>
    ) : null;

  return (
    <section className={cn('flex flex-col', isDesktop ? 'gap-5' : 'gap-[18px]')}>
      {isDesktop ? (
        <div className={cn(stepCardClasses, 'px-[22px] py-5')}>
          <p id="setup-presets" className={questionClasses}>
            Suggestions
          </p>
          {suggestions}
        </div>
      ) : (
        <div>
          <p id="setup-presets" className={questionClasses}>
            Suggestions
          </p>
          {suggestions}
        </div>
      )}

      <div className={cn(stepCardClasses, isDesktop ? 'px-3 pt-[18px] pb-2.5' : 'overflow-hidden')}>
        <div
          className={cn(
            'flex items-baseline justify-between',
            isDesktop ? 'flex-wrap gap-x-3 gap-y-1 px-2.5 pb-2' : 'gap-2.5 px-4 py-3.5'
          )}>
          <h2 className={cn('font-extrabold', isDesktop ? 'text-base' : 'text-[15px]')}>
            {isDesktop ? 'Your regular payments' : 'Your payments'}{' '}
            <span className="num text-muted">({values.regulars.length})</span>
          </h2>
          <p className={cn('text-muted', isDesktop ? 'text-[13px]' : 'text-right text-xs')}>
            <span className="num font-extrabold text-expense">{formatMoney(monthlyTotal)}</span>{' '}
            {isDesktop ? 'a month going out' : 'a month out'}
            {yearly}
          </p>
        </div>

        {values.regulars.length === 0 ? (
          <p
            className={cn(
              'text-sm leading-normal text-muted',
              isDesktop
                ? 'mx-2.5 mt-1 mb-3 rounded-[22px] border border-dashed border-border-strong p-7 text-center'
                : 'border-t border-border p-4'
            )}>
            No regular payments yet. Tap a suggestion above or add your own.
          </p>
        ) : (
          <div className={cn(isDesktop && 'flex flex-col gap-0.5')}>
            {values.regulars.map(regular => {
              const income = regular.input.type === 'INCOME';
              return (
                <SetupRow
                  key={regular.id}
                  name={regular.input.name}
                  details={regularDetails(regular, { accounts, today })}
                  // Desktop leaves money out unsigned, in red; mobile's board signs it
                  amount={
                    (income ? '+' : isDesktop ? '' : MINUS) + formatMoney(regular.input.amount)
                  }
                  next={regularNext(regular, { today })}
                  tone={income ? 'income' : 'expense'}
                  onOpen={() => setup.openPayment({ kind: 'recurring', id: regular.id })}
                  onRemove={() => setup.payment.remove(regular.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <Button
          size={isDesktop ? 'lg' : 'xl'}
          onClick={() => setup.openPayment({ kind: 'recurring' })}
          className={cn(
            'border-dashed border-border-strong font-bold',
            !isDesktop && 'h-[52px] w-full'
          )}>
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          Add custom payment
        </Button>
        {isDesktop ? (
          <p className="text-[13px] text-muted">Nothing is saved until you finish setup.</p>
        ) : null}
      </div>
    </section>
  );
};
