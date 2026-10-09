import { Trash2 } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { categoryLabel, FREQUENCIES, FREQUENCY_LABELS, RECURRING_CATEGORIES } from '~/lib/payments';
import { SetupState } from '../../../hooks';
import { RegularDraft, regularErrors, RegularField } from '../../../setupModel';
import { fieldLabelClasses } from '../setupClasses';

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

export const RegularRow = ({ regular, setup, showErrors }: RegularRowProps) => {
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
