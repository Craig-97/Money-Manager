import { Check, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AmountInput } from '~/components/form/AmountInput';
import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Radio } from '~/components/form/Radio';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { CalendarIcon } from '~/components/icons';
import { optionClasses, popoverClasses } from '~/components/ui/popoverClasses';
import { PayFrequency } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { formatLongDate } from '~/lib/dates';
import { SetupState } from '../../../hooks';
import {
  allowedRules,
  MAIN_FREQUENCIES,
  MORE_FREQUENCIES,
  PAY_FREQUENCY_LABELS,
  PayErrors,
  REGIONS,
  ruleDescription,
  RULES,
  usesWeekday,
  WEEKDAYS
} from '../../../setupModel';
import {
  choiceClasses,
  fieldLabelClasses,
  helpClasses,
  questionClasses,
  stepCardClasses
} from '../setupClasses';

interface PayStepProps {
  setup: SetupState;
  errors: PayErrors;
  // The next two paydays from these answers
  nextPaydays: Date[];
}

const describedBy = (...ids: (string | false | undefined)[]) =>
  ids.filter(Boolean).join(' ') || undefined;

/* Step 1: how often and on which day pay arrives, and how much */
export const PayStep = ({ setup, errors, nextPaydays }: PayStepProps) => {
  const { values, update, setFrequency } = setup;
  const isMore = MORE_FREQUENCIES.includes(values.frequency);
  const [next, then] = nextPaydays;

  return (
    <section className={cn(stepCardClasses, 'flex flex-col gap-[26px] p-6')}>
      <div role="group" aria-labelledby="pay-frequency">
        <p id="pay-frequency" className={questionClasses}>
          How often are you paid?
        </p>
        <div className="flex flex-wrap gap-2">
          {MAIN_FREQUENCIES.map(frequency => (
            <button
              key={frequency}
              type="button"
              aria-pressed={values.frequency === frequency}
              onClick={() => setFrequency(frequency)}
              className={choiceClasses}>
              {PAY_FREQUENCY_LABELS[frequency]}
            </button>
          ))}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-label="Other pay frequencies"
              aria-pressed={isMore}
              className={cn(choiceClasses, 'group')}>
              {isMore ? PAY_FREQUENCY_LABELS[values.frequency] : 'More'}
              <ChevronDown
                size={14}
                strokeWidth={2.25}
                aria-hidden="true"
                className="transition-transform group-aria-expanded:rotate-180"
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={8}
                className={cn(popoverClasses, 'flex min-w-[210px] flex-col gap-0.5 p-1.5')}>
                <DropdownMenu.RadioGroup
                  value={values.frequency}
                  onValueChange={value => setFrequency(value as PayFrequency)}>
                  {MORE_FREQUENCIES.map(frequency => (
                    <DropdownMenu.RadioItem
                      key={frequency}
                      value={frequency}
                      className={cn(
                        optionClasses,
                        'justify-between data-[state=checked]:bg-accent-soft data-[state=checked]:font-bold'
                      )}>
                      {PAY_FREQUENCY_LABELS[frequency]}
                      <DropdownMenu.ItemIndicator>
                        <Check
                          size={16}
                          strokeWidth={2.5}
                          className="text-accent-text"
                          aria-hidden="true"
                        />
                      </DropdownMenu.ItemIndicator>
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="pay-rule">
        <p id="pay-rule" className={questionClasses}>
          Which day?
        </p>
        <div className="grid gap-2.5 min-[53.75rem]:grid-cols-3">
          {allowedRules(values.frequency).map(rule => (
            <label
              key={rule}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-[20px] border-[1.5px] border-border-strong bg-surface-2 px-[18px] py-4 transition-colors hover:border-accent',
                values.rule === rule && 'border-accent bg-accent-soft'
              )}>
              <Radio
                name="pay-rule"
                checked={values.rule === rule}
                onChange={() => update('rule', rule)}
              />
              <span className="flex flex-col gap-[3px]">
                <span className="text-sm font-bold">{RULES[rule].title}</span>
                <span className="text-xs leading-[1.4] text-muted">
                  {ruleDescription(rule, values.frequency)}
                </span>
              </span>
            </label>
          ))}
        </div>

        {values.rule === 'SET_DAY' ? (
          <div className="mt-4 max-w-[220px]">
            <label htmlFor="pay-day" className={fieldLabelClasses}>
              Day of the month
            </label>
            <TextInput
              id="pay-day"
              inputMode="numeric"
              value={values.dayOfMonth}
              onChange={event => update('dayOfMonth', event.target.value)}
              invalid={!!errors.dayOfMonth}
              aria-describedby={errors.dayOfMonth ? 'pay-day-error' : undefined}
            />
            {errors.dayOfMonth ? (
              <FieldError id="pay-day-error">{errors.dayOfMonth}</FieldError>
            ) : null}
          </div>
        ) : null}

        {usesWeekday(values.rule) ? (
          <div role="group" aria-label="Weekday" className="mt-4 flex flex-wrap gap-2">
            {WEEKDAYS.map(weekday => (
              <button
                key={weekday.value}
                type="button"
                aria-label={weekday.long}
                aria-pressed={values.weekday === weekday.value}
                onClick={() => update('weekday', weekday.value)}
                className={cn(choiceClasses, 'w-[60px] px-0')}>
                {weekday.short}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 min-[53.75rem]:grid-cols-2">
        {values.frequency === 'MONTHLY' ? null : (
          <div>
            <label htmlFor="pay-first" className={fieldLabelClasses}>
              Date of your next pay
            </label>
            <DatePicker
              id="pay-first"
              value={values.firstPayDate}
              onChange={value => update('firstPayDate', value)}
              invalid={!!errors.firstPayDate}
              aria-describedby={errors.firstPayDate ? 'pay-first-error' : undefined}
            />
            {errors.firstPayDate ? (
              <FieldError id="pay-first-error">{errors.firstPayDate}</FieldError>
            ) : null}
          </div>
        )}
        <div>
          <label htmlFor="pay-region" className={fieldLabelClasses}>
            Bank holidays
          </label>
          <Select
            id="pay-region"
            value={values.region}
            onValueChange={value => update('region', value)}
            options={REGIONS}
            aria-describedby="pay-region-help"
          />
        </div>
      </div>
      <p id="pay-region-help" className={cn(helpClasses, '-mt-4')}>
        If payday lands on a weekend or bank holiday we'll move it to the working day before.
      </p>

      <div>
        <label htmlFor="pay-income" className={questionClasses}>
          Take-home pay per month
        </label>
        <AmountInput
          id="pay-income"
          size="hero"
          value={values.income}
          onChange={event => update('income', event.target.value)}
          invalid={!!errors.income}
          aria-describedby={describedBy(errors.income && 'pay-income-error', 'pay-income-help')}
        />
        {errors.income ? <FieldError id="pay-income-error">{errors.income}</FieldError> : null}
        <p id="pay-income-help" className={helpClasses}>
          What actually lands in your account after tax and deductions.
        </p>
      </div>

      {next ? (
        <div className="flex items-center gap-3.5 rounded-[20px] border border-border bg-surface-2 px-4 py-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent-text">
            <CalendarIcon size={20} strokeWidth={1.9} />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold">
              Next payday: {formatLongDate(next, { withYear: false })}
            </p>
            {then ? (
              <p className="text-[13px] text-muted">
                Then {formatLongDate(then, { withYear: false })}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
};
