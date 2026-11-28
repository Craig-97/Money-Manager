import { formatShortDay } from '~/lib/dates';
import { Button } from '../../../../ui';

interface RateEndedPromptProps {
  endedOn: Date;
  onSetNew: () => void;
  onNone: () => void;
}

/* Once a debt's rate end has gone by: update the rate, then set the new rate end or say it has none */
export const RateEndedPrompt = ({ endedOn, onSetNew, onNone }: RateEndedPromptProps) => (
  <div
    role="status"
    className="flex flex-col gap-2.5 rounded-[18px] border border-border-strong bg-surface-2 px-3.5 py-3">
    <span className="text-sm leading-[1.4] font-bold">
      The rate ended on {formatShortDay(endedOn)}. Update the APR and payment, then set when the new
      rate ends.
    </span>
    <div className="flex flex-wrap gap-2">
      <Button variant="accent" onClick={onSetNew} className="h-10 text-[13px]">
        Set new rate end
      </Button>
      <Button variant="ghost" onClick={onNone} className="h-10 text-[13px]">
        No end date
      </Button>
    </div>
  </div>
);
