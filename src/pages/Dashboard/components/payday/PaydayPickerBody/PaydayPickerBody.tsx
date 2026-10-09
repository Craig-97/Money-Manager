import { Calendar } from '~/components/form/DatePicker';
import { cn } from '~/lib/cn';
import { isSameDay, toIsoDate } from '~/lib/dates';
import { formatBalance } from '~/lib/format';
import { PaydayOverride } from '../../../hooks';
import { PreviewRow } from '../PreviewRow';

// The usual date is ringed and a bank holiday struck through, as in the design
const modifierClasses = {
  usual:
    '[&>button]:font-extrabold [&>button]:text-accent-text [&>button]:shadow-[inset_0_0_0_1.5px_var(--accent-text)]',
  holiday: '[&>button]:text-faint [&>button]:line-through'
};

const names = (list: string[]) => list.join(', ');

/* The calendar for choosing when this payday arrives, and what that does to the cycle */
export const PaydayPickerBody = ({ override }: { override: PaydayOverride }) => {
  const { picked, usual, preview, holidays } = override;
  const freeChanged = preview.freeBefore !== preview.freeAfter;

  return (
    <div className="flex flex-col gap-3.5">
      <Calendar
        selected={picked}
        onSelect={override.pick}
        defaultMonth={picked}
        disabled={{ before: override.earliest, after: override.latest }}
        modifiers={{
          usual: date => isSameDay(date, usual) && !isSameDay(date, picked),
          holiday: date => holidays.has(toIsoDate(date))
        }}
        modifierClasses={modifierClasses}
        autoFocus
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 px-1 text-[11px] font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full bg-accent" />
          New date
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-3 rounded-full shadow-[inset_0_0_0_1.5px_var(--accent-text)]"
          />
          Usual payday
        </span>
        <span className="inline-flex items-center gap-1.5 text-faint">
          <span aria-hidden="true" className="line-through">
            25
          </span>
          Bank holiday
        </span>
      </div>
      <div
        aria-label="What changes"
        role="group"
        className={cn(
          'flex flex-col gap-2 rounded-2xl border border-border bg-surface-2 px-3.5 py-3',
          !override.changed && 'opacity-60'
        )}>
        <PreviewRow label="Days to go">
          {preview.daysBefore}
          {override.changed ? <> → {preview.daysAfter}</> : null}
        </PreviewRow>
        <PreviewRow label="Free to spend">
          {freeChanged ? (
            <>
              <span className="font-semibold text-muted line-through">
                {formatBalance(preview.freeBefore)}
              </span>{' '}
              <span className={cn(preview.freeAfter < 0 ? 'text-expense' : 'text-income')}>
                {formatBalance(preview.freeAfter)}
              </span>
            </>
          ) : (
            formatBalance(preview.freeAfter)
          )}
        </PreviewRow>
        {preview.leaving.length ? (
          <PreviewRow label="Moves to next cycle">
            <span className="font-bold">{names(preview.leaving)}</span>
          </PreviewRow>
        ) : null}
        {preview.joining.length ? (
          <PreviewRow label="Now due before payday">
            <span className="font-bold">{names(preview.joining)}</span>
          </PreviewRow>
        ) : null}
      </div>
    </div>
  );
};
