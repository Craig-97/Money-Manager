import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { PaymentType } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { parseIsoDate } from '~/lib/dates';
import { formatMoney, MINUS, parseMoney } from '~/lib/format';
import { categoryLabel, formatShortDate, ONE_OFF_CATEGORIES } from '~/lib/payments';
import { SetupState } from '../../../hooks';
import { MAX_ONE_OFFS, OneOffDraft } from '../../../setupModel';
import { fieldLabelClasses, stepCardClasses } from '../setupClasses';

const CATEGORY_OPTIONS = ONE_OFF_CATEGORIES.map(value => ({ value, label: categoryLabel(value) }));

const TYPE_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: 'EXPENSE', label: 'Money out' },
  { value: 'INCOME', label: 'Money in' }
];

const EMPTY_DRAFT: Omit<OneOffDraft, 'id'> = {
  name: '',
  amount: '',
  date: '',
  type: 'EXPENSE',
  category: 'OTHER'
};

// Which field an add error is about, so that field is marked invalid
const fieldOf = (error: string) =>
  /name/i.test(error)
    ? 'name'
    : /amount/i.test(error)
      ? 'amount'
      : /date/i.test(error)
        ? 'date'
        : null;

/* Step 4: one-off payments already known about. Optional. */
export const ComingUpStep = ({ setup }: { setup: SetupState }) => {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState<string>();
  const { oneOffs } = setup.values;

  const set = (patch: Partial<typeof draft>) => {
    setDraft(current => ({ ...current, ...patch }));
    setError(undefined);
  };

  const add = () => {
    const problem = setup.addOneOff(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setDraft(EMPTY_DRAFT);
  };

  const invalid = (field: string) => !!error && fieldOf(error) === field;
  const describedBy = (field: string) => (invalid(field) ? 'one-off-error' : undefined);

  return (
    <section className="flex flex-col gap-5">
      <div className={cn(stepCardClasses, 'overflow-hidden')}>
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[15px] font-extrabold">One-off payments</h2>
          <span className="text-xs text-muted">
            <span className="num">{oneOffs.length}</span> of {MAX_ONE_OFFS}
          </span>
        </div>
        {oneOffs.length === 0 ? (
          <p className="border-t border-border p-5 text-sm text-muted">Nothing added yet.</p>
        ) : (
          <ul>
            {oneOffs.map(oneOff => {
              const income = oneOff.type === 'INCOME';
              const date = parseIsoDate(oneOff.date);
              return (
                <li
                  key={oneOff.id}
                  className="flex min-h-16 items-center gap-3 border-t border-border pr-2 pl-[18px]">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold',
                      income ? 'bg-income-bg text-income' : 'bg-expense-bg text-expense'
                    )}>
                    {oneOff.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 grow flex-col gap-0.5">
                    <span className="text-sm font-semibold">{oneOff.name}</span>
                    <span className="text-xs text-muted">
                      {categoryLabel(oneOff.category)} · {date ? formatShortDate(date) : 'No date'}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'num text-sm font-semibold',
                      income ? 'text-income' : 'text-expense'
                    )}>
                    {income ? '+' : MINUS}
                    {formatMoney(parseMoney(oneOff.amount) ?? 0)}
                  </span>
                  <IconButton
                    aria-label={`Remove ${oneOff.name}`}
                    onClick={() => setup.removeOneOff(oneOff.id)}>
                    <Trash2 size={18} aria-hidden="true" />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={cn(stepCardClasses, 'flex flex-col gap-3.5 px-[22px] py-5')}>
        <h2 className="text-[15px] font-extrabold">Add a payment</h2>
        <SegmentedControl
          aria-label="Payment type"
          size="lg"
          fullWidth
          value={draft.type}
          onValueChange={type => set({ type })}
          options={TYPE_OPTIONS}
        />
        <div className="grid gap-3 min-[53.75rem]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor="one-off-name" className={fieldLabelClasses}>
              Name
            </label>
            <TextInput
              id="one-off-name"
              value={draft.name}
              onChange={event => set({ name: event.target.value })}
              placeholder="e.g. Car MOT"
              invalid={invalid('name')}
              aria-describedby={describedBy('name')}
            />
          </div>
          <div>
            <label htmlFor="one-off-amount" className={fieldLabelClasses}>
              Amount
            </label>
            <AmountInput
              id="one-off-amount"
              value={draft.amount}
              onChange={event => set({ amount: event.target.value })}
              placeholder="0.00"
              invalid={invalid('amount')}
              aria-describedby={describedBy('amount')}
              className={draft.type === 'INCOME' ? 'text-income' : 'text-expense'}
            />
          </div>
        </div>
        <div className="grid gap-3 min-[53.75rem]:grid-cols-2">
          <div>
            <label htmlFor="one-off-date" className={fieldLabelClasses}>
              Due date
            </label>
            <DatePicker
              id="one-off-date"
              value={draft.date}
              onChange={date => set({ date })}
              invalid={invalid('date')}
              aria-describedby={describedBy('date')}
            />
          </div>
          <div>
            <label htmlFor="one-off-category" className={fieldLabelClasses}>
              Category
            </label>
            <Select
              id="one-off-category"
              value={draft.category}
              onValueChange={category => set({ category })}
              options={CATEGORY_OPTIONS}
            />
          </div>
        </div>
        {error ? (
          <FieldError id="one-off-error" alert className="mt-0">
            {error}
          </FieldError>
        ) : null}
        <Button size="lg" onClick={add} className="self-start font-bold">
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          Add payment
        </Button>
      </div>
    </section>
  );
};
