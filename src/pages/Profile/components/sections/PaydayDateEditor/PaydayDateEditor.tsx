import { DatePicker } from '~/components/form/DatePicker';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Button } from '~/components/ui/Button';
import { SegmentedControl, SegmentedOption } from '~/components/ui/SegmentedControl';
import { cn } from '~/lib/cn';
import { formatShortDay, toIsoDate } from '~/lib/dates';
import { PaydayDates, QuickPick } from '../../../hooks';
import { PaydayPreview } from '../../../profileModel';
import { helpClasses } from '../settingsClasses';

const QUICK_PICKS: SegmentedOption<QuickPick>[] = [
  { value: 'before', label: 'Day before' },
  { value: 'week', label: 'A week earlier' },
  { value: 'pick', label: 'Pick a date' }
];

/* Change one upcoming payday: a quick pick or any date, and put it back */
export const PaydayDateEditor = ({
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
