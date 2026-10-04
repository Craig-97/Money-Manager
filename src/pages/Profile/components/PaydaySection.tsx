import { CalendarClock } from 'lucide-react';
import { DatePicker } from '~/components/form/DatePicker';
import { choiceClasses } from '~/components/form/fieldClasses';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Radio } from '~/components/form/Radio';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { PayFrequency } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { cn } from '~/lib/cn';
import { formatShortDay } from '~/lib/dates';
import {
  allowedRules,
  PAY_FREQUENCY_LABELS,
  REGIONS,
  ruleDescription,
  RULES,
  WEEKDAYS
} from '~/lib/payday';
import { usePaydaySettings } from '../hooks';
import { SECTION_ICONS } from './ProfileNav';
import { helpClasses, SettingsTile } from './SettingsTile';

const FREQUENCIES = (Object.keys(PAY_FREQUENCY_LABELS) as PayFrequency[]).map(value => ({
  value,
  label: PAY_FREQUENCY_LABELS[value]
}));

const PREVIEW_LABELS = ['Next', 'Then', 'After that'];

/* How often and on which day pay arrives, with the next paydays that gives */
export const PaydaySection = ({ account }: { account: Account }) => {
  const payday = usePaydaySettings(account);
  const { values, update, errors, preview } = payday;
  const moved = preview.find(item => item.movedFrom);

  return (
    <SettingsTile
      id="payday"
      icon={SECTION_ICONS.payday}
      title="Payday"
      description="When you get paid. We use this for your countdown, Free to spend and the payday prompt."
      mobileDescription="Drives your countdown and Free to spend."
      onSubmit={payday.save}
      footer={
        <>
          <span className={helpClasses}>Your current cycle moves to match straight away.</span>
          <Button
            type="submit"
            variant="accent"
            loading={payday.saving}
            loadingText="Saving…"
            className="font-bold">
            Save payday settings
          </Button>
        </>
      }>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="payday-frequency">Frequency</Label>
          <Select
            id="payday-frequency"
            value={values.frequency}
            onValueChange={payday.setFrequency}
            options={FREQUENCIES}
          />
        </div>
        <div>
          <Label htmlFor="payday-region">Bank holiday region</Label>
          <Select
            id="payday-region"
            value={values.region}
            onValueChange={region => update('region', region)}
            options={REGIONS}
          />
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="payday-rule">
        <p id="payday-rule" className="mb-2 text-[13px] font-bold">
          Payday type
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {allowedRules(values.frequency).map(rule => (
            <label
              key={rule}
              className={cn(
                'relative flex min-h-24 cursor-pointer flex-col gap-1.5 rounded-[18px] border border-border bg-surface-2 p-4 transition-colors hover:border-border-strong',
                values.rule === rule && 'border-accent bg-accent-soft hover:border-accent'
              )}>
              <Radio
                name="payday-rule"
                checked={values.rule === rule}
                onChange={() => update('rule', rule)}
                className="absolute top-3.5 right-3.5 size-5"
              />
              <span className="pr-7 text-sm font-extrabold">{RULES[rule].title}</span>
              <span className="text-xs leading-[1.45] font-medium text-muted">
                {ruleDescription(rule, values.frequency)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {values.rule === 'SET_DAY' ? (
        <div className="md:max-w-[calc(50%-8px)]">
          <Label htmlFor="payday-day">Day of month</Label>
          <TextInput
            id="payday-day"
            inputMode="numeric"
            className="num"
            value={values.dayOfMonth}
            onChange={event => update('dayOfMonth', event.target.value)}
            invalid={!!errors.dayOfMonth}
            aria-describedby={errors.dayOfMonth ? 'payday-day-error' : 'payday-day-help'}
          />
          {errors.dayOfMonth ? (
            <FieldError id="payday-day-error">{errors.dayOfMonth}</FieldError>
          ) : (
            <p id="payday-day-help" className={cn('mt-2', helpClasses)}>
              If it falls on a weekend or bank holiday, we’ll use the working day before.
            </p>
          )}
        </div>
      ) : null}

      {values.rule === 'SET_WEEKDAY' ? (
        <div role="group" aria-label="Weekday" className="flex flex-wrap gap-2">
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

      {values.frequency === 'MONTHLY' ? null : (
        <div className="md:max-w-[calc(50%-8px)]">
          <Label htmlFor="payday-first">Date of your next pay</Label>
          <DatePicker
            id="payday-first"
            value={values.firstPayDate}
            onChange={value => update('firstPayDate', value)}
            invalid={!!errors.firstPayDate}
            aria-describedby={errors.firstPayDate ? 'payday-first-error' : undefined}
          />
          {errors.firstPayDate ? (
            <FieldError id="payday-first-error">{errors.firstPayDate}</FieldError>
          ) : null}
        </div>
      )}

      {preview.length ? (
        <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[13px] font-extrabold">Next paydays</h3>
            <span className={helpClasses}>Weekends and bank holidays move to the day before</span>
          </div>
          <ol className="grid gap-2.5 md:grid-cols-3">
            {preview.map((item, index) => (
              <li
                key={item.date.getTime()}
                className={cn(
                  'flex min-w-0 flex-col gap-0.5 rounded-2xl border border-border bg-surface px-4 py-3',
                  item.movedFrom && 'border-accent bg-accent-soft'
                )}>
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-semibold text-muted',
                    item.movedFrom && 'font-bold text-accent-text'
                  )}>
                  {item.movedFrom ? (
                    <>
                      <CalendarClock size={13} aria-hidden="true" />
                      Moved
                    </>
                  ) : (
                    PREVIEW_LABELS[index]
                  )}
                </span>
                <span className="num text-[17px] font-extrabold">{formatShortDay(item.date)}</span>
              </li>
            ))}
          </ol>
          {moved?.movedFrom ? (
            <p className={cn('flex items-center gap-1.5', helpClasses)}>
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
              Moved from {formatShortDay(moved.movedFrom)} (bank holiday)
            </p>
          ) : null}
        </div>
      ) : null}
    </SettingsTile>
  );
};
