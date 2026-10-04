import { Check, Plus, Trash2 } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { categoryLabel, FREQUENCIES, FREQUENCY_LABELS, RECURRING_CATEGORIES } from '~/lib/payments';
import { SetupState } from '../hooks';
import { PRESETS, RegularDraft, regularErrors, RegularField } from '../setupModel';
import { fieldLabelClasses, questionClasses, stepCardClasses } from './setupClasses';

const FREQUENCY_OPTIONS = FREQUENCIES.map(value => ({ value, label: FREQUENCY_LABELS[value] }));
const CATEGORY_OPTIONS = RECURRING_CATEGORIES.map(value => ({
  value,
  label: categoryLabel(value)
}));

interface RegularRowProps {
  regular: RegularDraft;
  setup: SetupState;
  showErrors: boolean;
}

const RegularRow = ({ regular, setup, showErrors }: RegularRowProps) => {
  const errors = showErrors ? regularErrors(regular, setup.values) : [];
  const errorId = (field: RegularField) => `${regular.id}-${field}-error`;
  const invalid = (field: RegularField) => errors.some(error => error.field === field);
  const describedBy = (field: RegularField) => (invalid(field) ? errorId(field) : undefined);
  const set = (patch: Partial<RegularDraft>) => setup.updateRegular(regular.id, patch);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-3xl border border-border bg-surface px-4 pt-4 pb-[18px]',
        errors.length && 'border-expense'
      )}>
      <div className="flex items-end gap-3">
        <div className="min-w-0 grow">
          <label htmlFor={`${regular.id}-name`} className={fieldLabelClasses}>
            Name
          </label>
          <TextInput
            id={`${regular.id}-name`}
            value={regular.name}
            onChange={event => set({ name: event.target.value })}
            placeholder="e.g. Car tax"
            invalid={invalid('name')}
            aria-describedby={describedBy('name')}
          />
        </div>
        <div className="w-[150px] shrink-0">
          <label htmlFor={`${regular.id}-amount`} className={fieldLabelClasses}>
            Amount
          </label>
          <AmountInput
            id={`${regular.id}-amount`}
            value={regular.amount}
            onChange={event => set({ amount: event.target.value })}
            placeholder="0.00"
            invalid={invalid('amount')}
            aria-describedby={describedBy('amount')}
            className="text-expense"
          />
        </div>
        <IconButton
          aria-label={`Remove ${regular.name || 'payment'}`}
          onClick={() => setup.removeRegular(regular.id)}>
          <Trash2 size={18} aria-hidden="true" />
        </IconButton>
      </div>
      <div className="grid gap-3 min-[53.75rem]:grid-cols-3 min-[53.75rem]:pr-14">
        <div>
          <label htmlFor={`${regular.id}-frequency`} className={fieldLabelClasses}>
            How often
          </label>
          <Select
            id={`${regular.id}-frequency`}
            value={regular.frequency}
            onValueChange={frequency => set({ frequency })}
            options={FREQUENCY_OPTIONS}
          />
        </div>
        <div>
          <label htmlFor={`${regular.id}-date`} className={fieldLabelClasses}>
            Next payment
          </label>
          <DatePicker
            id={`${regular.id}-date`}
            value={regular.date}
            onChange={date => set({ date })}
            invalid={invalid('date')}
            aria-describedby={describedBy('date')}
          />
        </div>
        <div>
          <label htmlFor={`${regular.id}-category`} className={fieldLabelClasses}>
            Category
          </label>
          <Select
            id={`${regular.id}-category`}
            value={regular.category}
            onValueChange={category => set({ category })}
            options={CATEGORY_OPTIONS}
          />
        </div>
      </div>
      {errors.length ? (
        <div className="flex flex-col gap-1">
          {errors.map(error => (
            <FieldError key={error.field} id={errorId(error.field)} className="mt-0">
              {error.message}
            </FieldError>
          ))}
        </div>
      ) : null}
    </div>
  );
};

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
