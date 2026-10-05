import { CalendarClock, PenLine } from 'lucide-react';
import { DatePicker } from '~/components/form/DatePicker';
import { choiceClasses } from '~/components/form/fieldClasses';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Radio } from '~/components/form/Radio';
import { Select } from '~/components/form/Select';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { SegmentedControl, SegmentedOption } from '~/components/ui/SegmentedControl';
import { PayFrequency } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { cn } from '~/lib/cn';
import { formatShortDay, toIsoDate } from '~/lib/dates';
import {
  allowedRules,
  PAY_FREQUENCY_LABELS,
  REGIONS,
  ruleDescription,
  RULES,
  usesWeekday,
  WEEKDAYS
} from '~/lib/payday';
import { PaydayDates, QuickPick, usePaydaySettings } from '../hooks';
import { PaydayPreview } from '../profileModel';
import { SECTION_ICONS } from './ProfileNav';
import { helpClasses, SettingsTile } from './SettingsTile';

const FREQUENCIES = (Object.keys(PAY_FREQUENCY_LABELS) as PayFrequency[]).map(value => ({
  value,
  label: PAY_FREQUENCY_LABELS[value]
}));

const PREVIEW_LABELS = ['Next', 'Then', 'After that'];

const QUICK_PICKS: SegmentedOption<QuickPick>[] = [
  { value: 'before', label: 'Day before' },
  { value: 'week', label: 'A week earlier' },
  { value: 'pick', label: 'Pick a date' }
];

/* Change one upcoming payday: a quick pick or any date, and put it back */
const PaydayDateEditor = ({
  dates,
  item,
  following
}: {
  dates: PaydayDates;
  item: PaydayPreview;
  following: Date | undefined;
}) => (
  <div
    role="group"
    aria-label={`Change ${formatShortDay(item.date)}`}
    className="flex flex-col gap-3.5 rounded-[18px] border border-border-strong bg-surface p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h4 className="text-sm font-extrabold">Change {formatShortDay(item.date)} to</h4>
      <SegmentedControl
        aria-label="Quick picks"
        size="md"
        value={dates.quick}
        onValueChange={dates.pickQuick}
        options={QUICK_PICKS}
      />
    </div>
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,320px)_1fr]">
      <div>
        <Label htmlFor="payday-override-date">New date</Label>
        <DatePicker
          id="payday-override-date"
          value={dates.draft}
          onChange={value => {
            dates.pickQuick('pick');
            dates.setDraft(value);
          }}
          min={toIsoDate(new Date())}
          invalid={!!dates.error}
          aria-describedby={dates.error ? 'payday-override-error' : undefined}
        />
        {dates.error ? <FieldError id="payday-override-error">{dates.error}</FieldError> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 md:mt-[30px] md:justify-end">
        {item.moved ? (
          <Button variant="ghost" onClick={() => dates.reset(dates.editing ?? 0)}>
            Reset to usual
          </Button>
        ) : null}
        <Button variant="ghost" onClick={dates.close}>
          Cancel
        </Button>
        <Button
          variant="accent"
          disabled={!!dates.error}
          loading={dates.saving}
          loadingText="Saving…"
          onClick={dates.save}
          className="font-bold">
          Save date
        </Button>
      </div>
    </div>
    <p className={cn('flex items-center gap-1.5', helpClasses)}>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
      This payday only.
      {following ? ` ${formatShortDay(following)} is unchanged.` : ' Later paydays are unchanged.'}
    </p>
  </div>
);

/* How often and on which day pay arrives, with the next paydays that gives */
export const PaydaySection = ({ account }: { account: Account }) => {
  const payday = usePaydaySettings(account);
  const { values, update, errors, preview, dates } = payday;

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
          <span className={helpClasses}>
            Your current cycle moves to match straight away. A single moved payday clears itself
            once it has passed.
          </span>
          <Button
            type="submit"
            variant="accent"
            disabled={!payday.isDirty}
            loading={payday.saving}
            loadingText="Saving…"
            className="font-bold">
            Save changes
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

      {usesWeekday(values.rule) ? (
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
            <span className={helpClasses}>
              {dates.locked
                ? 'Save your changes to adjust a single payday'
                : 'Weekends and bank holidays move to the day before. Tap a date to change it.'}
            </span>
          </div>
          <ol className="grid gap-2.5 md:grid-cols-3">
            {preview.map((item, index) => {
              const editing = dates.editing === index;
              const label = PREVIEW_LABELS[index];
              return (
                <li key={item.date.getTime()} className="flex">
                  <button
                    type="button"
                    disabled={dates.locked || !account.payday}
                    aria-expanded={editing}
                    aria-label={`${label}, ${formatShortDay(item.date)}${item.moved ? ', moved by you' : ''}. Change`}
                    onClick={() => (editing ? dates.close() : dates.start(index))}
                    className={cn(
                      'relative flex min-h-[84px] w-full min-w-0 cursor-pointer flex-col gap-0.5 rounded-2xl border border-border bg-surface px-4 py-3 pr-12 text-left transition-colors hover:border-border-strong disabled:cursor-default disabled:opacity-70 disabled:hover:border-border',
                      (item.moved || item.movedFrom) && 'border-accent bg-accent-soft',
                      editing && 'border-accent shadow-[0_0_0_4px_var(--accent-soft)]'
                    )}>
                    <span
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-semibold text-muted',
                        (item.moved || item.movedFrom) && 'font-bold text-accent-text'
                      )}>
                      {item.movedFrom ? (
                        <>
                          <CalendarClock size={13} aria-hidden="true" />
                          Moved
                        </>
                      ) : item.moved ? (
                        `${label} · moved by you`
                      ) : (
                        label
                      )}
                    </span>
                    <span className="num text-[17px] font-extrabold">
                      {formatShortDay(item.date)}
                    </span>
                    {item.moved ? (
                      <span className="text-xs font-medium text-muted">
                        Usually {formatShortDay(item.usual)}
                      </span>
                    ) : item.movedFrom ? (
                      <span className="text-xs font-medium text-muted">
                        Moved from {formatShortDay(item.movedFrom)} (bank holiday)
                      </span>
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full text-muted',
                        item.moved && 'text-accent-text',
                        editing && 'bg-accent text-on-accent'
                      )}>
                      <PenLine size={15} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {dates.editing !== null && preview[dates.editing] ? (
            <PaydayDateEditor
              dates={dates}
              item={preview[dates.editing]}
              following={preview[dates.editing + 1]?.date}
            />
          ) : null}
        </div>
      ) : null}
    </SettingsTile>
  );
};
