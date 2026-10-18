import { cn } from '~/lib/cn';
import { EXTRA_CHOICES, extraLabel } from '../../debtsModel';

interface ExtraChoicesProps {
  extra: number;
  onChange: (extra: number) => void;
  className?: string;
}

/* "Pay extra each month": nothing, or £50, £100 or £200 on top */
export const ExtraChoices = ({ extra, onChange, className }: ExtraChoicesProps) => (
  <div className={className}>
    <p id="plan-extra" className="mb-2 text-[13px] font-bold text-muted">
      Pay extra each month
    </p>
    <div
      role="radiogroup"
      aria-labelledby="plan-extra"
      className="grid grid-cols-2 gap-2 min-[30rem]:flex min-[30rem]:flex-wrap">
      {EXTRA_CHOICES.map(choice => (
        <button
          key={choice}
          type="button"
          role="radio"
          aria-checked={extra === choice}
          onClick={() => onChange(choice)}
          className={cn(
            'inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-2 px-4 text-[13px] font-bold whitespace-nowrap text-text hover:bg-hover',
            'aria-checked:border-accent aria-checked:bg-accent-soft aria-checked:text-accent-text'
          )}>
          {extraLabel(choice)}
        </button>
      ))}
    </div>
  </div>
);
