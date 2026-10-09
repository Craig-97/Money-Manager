import { Check, Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { SetupState } from '../../../hooks';
import { PRESETS } from '../../../setupModel';
import { RegularRow } from '../RegularRow';
import { questionClasses, stepCardClasses } from '../setupClasses';

interface RegularsStepProps {
  setup: SetupState;
  monthlyTotal: number;
}

/* Step 3: bills and subscriptions, from suggestions or added by hand */
export const RegularsStep = ({ setup, monthlyTotal }: RegularsStepProps) => {
  const { values, showErrors } = setup;

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
                onClick={() => setup.togglePreset(preset.key)}
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

      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-extrabold">
          Your regular payments <span className="num text-muted">({values.regulars.length})</span>
        </h2>
        <p className="text-[13px] text-muted">
          <span className="num font-extrabold text-expense">{formatMoney(monthlyTotal)}</span> a
          month going out
        </p>
      </div>

      {values.regulars.length === 0 ? (
        <p className="rounded-[22px] border border-dashed border-border-strong p-7 text-center text-sm text-muted">
          No regular payments yet. Tap a suggestion above or add your own.
        </p>
      ) : (
        values.regulars.map(regular => (
          <RegularRow key={regular.id} regular={regular} setup={setup} showErrors={showErrors} />
        ))
      )}

      <Button
        size="lg"
        onClick={setup.addCustomRegular}
        className="self-start border-dashed font-bold">
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
        Add custom payment
      </Button>
    </section>
  );
};
