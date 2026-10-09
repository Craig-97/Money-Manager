import { Button } from '~/components/ui/Button';
import { isSameDay } from '~/lib/dates';
import { formatShortDate } from '~/lib/payments';
import { PaydayOverride } from '../../../hooks';

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
