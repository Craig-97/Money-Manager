import { Button } from '../../ui';

interface MaturedPromptProps {
  name: string;
  onNewTerm: () => void;
  onStop: () => void;
}

/* Once a fixed-term account has paid out, as a renewal that's gone by asks: a new term, or done */
export const MaturedPrompt = ({ name, onNewTerm, onStop }: MaturedPromptProps) => (
  <div
    role="status"
    className="flex flex-col gap-2.5 rounded-[18px] border border-border-strong bg-surface px-3.5 py-3">
    <span className="text-sm leading-[1.4] font-bold">
      {name} has matured. Has it started a new term?
    </span>
    <div className="flex flex-wrap gap-2">
      <Button variant="accent" onClick={onNewTerm} className="h-10 text-[13px]">
        Set a new term
      </Button>
      <Button variant="ghost" onClick={onStop} className="h-10 text-[13px]">
        No longer earns interest
      </Button>
    </div>
  </div>
);
