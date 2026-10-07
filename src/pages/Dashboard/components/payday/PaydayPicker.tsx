import { ReactNode } from 'react';
import { Calendar } from '~/components/form/DatePicker';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { cn } from '~/lib/cn';
import { isSameDay, toIsoDate } from '~/lib/dates';
import { formatBalance } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { PaydayOverride } from '../../hooks';

// The usual date is ringed and a bank holiday struck through, as in the design
const modifierClasses = {
  usual:
    '[&>button]:font-extrabold [&>button]:text-accent-text [&>button]:shadow-[inset_0_0_0_1.5px_var(--accent-text)]',
  holiday: '[&>button]:text-faint [&>button]:line-through'
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 text-[13px]">
    <span className="shrink-0 font-semibold text-muted">{label}</span>
    <span className="text-right num font-extrabold">{children}</span>
  </div>
);

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
        <Row label="Days to go">
          {preview.daysBefore}
          {override.changed ? <> → {preview.daysAfter}</> : null}
        </Row>
        <Row label="Free to spend">
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
        </Row>
        {preview.leaving.length ? (
          <Row label="Moves to next cycle">
            <span className="font-bold">{names(preview.leaving)}</span>
          </Row>
        ) : null}
        {preview.joining.length ? (
          <Row label="Now due before payday">
            <span className="font-bold">{names(preview.joining)}</span>
          </Row>
        ) : null}
      </div>
    </div>
  );
};

/* Save, cancel and put it back, for the picker's footer */
export const PaydayPickerActions = ({
  override,
  onCancel
}: {
  override: PaydayOverride;
  onCancel?: () => void;
}) => {
  const usualDate = isSameDay(override.picked, override.usual);
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      {override.moved ? (
        <Button
          variant="ghost"
          onClick={override.reset}
          disabled={override.saving}
          className="max-md:h-[52px]">
          Reset to usual
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} className="max-md:h-[52px]">
            Cancel
          </Button>
        ) : null}
        <Button
          variant="accent"
          loading={override.saving}
          loadingText="Saving…"
          onClick={override.save}
          className="font-bold max-md:h-[52px]">
          {!override.changed
            ? `Keep ${formatShortDate(override.picked)}`
            : usualDate
              ? 'Use usual date'
              : `Move to ${formatShortDate(override.picked)}`}
        </Button>
      </div>
    </div>
  );
};

/* The whole picker as a dialog: centred on desktop, a bottom sheet on mobile */
export const PaydayOverrideDialog = ({ override }: { override: PaydayOverride }) => (
  <Modal
    open={override.open}
    onOpenChange={override.setOpen}
    title="Change this payday"
    description={`Just this payday. Usually ${formatShortDate(override.usual)}.`}
    footer={<PaydayPickerActions override={override} onCancel={() => override.setOpen(false)} />}>
    <p className="-mt-1 pl-1 text-[13px] font-medium text-muted md:pl-0">
      Just this one. Usually {formatShortDate(override.usual)}.
    </p>
    <PaydayPickerBody override={override} />
  </Modal>
);
