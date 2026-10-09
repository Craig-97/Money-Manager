import { Button } from '~/components/ui/Button';
import { formatShortDay } from '~/lib/dates';

interface RenewalPromptProps {
  renewedOn: Date;
  onSetNext: () => void;
  onStop: () => void;
}

/* Once a renewal date has gone by: set the next one, or say it no longer renews */
export const RenewalPrompt = ({ renewedOn, onSetNext, onStop }: RenewalPromptProps) => (
  <div
    role="status"
    className="flex flex-col gap-2.5 rounded-[18px] border border-border-strong bg-surface-2 px-3.5 py-3">
    <span className="text-sm leading-[1.4] font-bold">
      Renewed on {formatShortDay(renewedOn)}. Has the price or date changed for next year?
    </span>
    <div className="flex flex-wrap gap-2">
      <Button variant="accent" onClick={onSetNext} className="h-10 text-[13px]">
        Set next renewal
      </Button>
      <Button variant="ghost" onClick={onStop} className="h-10 text-[13px]">
        No longer renews
      </Button>
    </div>
  </div>
);
