import { cn } from '~/lib/cn';

interface AlertDotsProps {
  index: number;
  count: number;
  onGo: (index: number) => void;
}

/* Mobile: a dot for each alert, the current one long. Swiping the card moves between them too. */
export const AlertDots = ({ index, count, onGo }: AlertDotsProps) => (
  <div
    role="group"
    aria-label="Alerts"
    className="-my-2 flex items-center justify-center gap-0.5 md:hidden">
    {Array.from({ length: count }, (_, dot) => (
      <button
        key={dot}
        type="button"
        aria-label={`Alert ${dot + 1} of ${count}`}
        aria-current={dot === index || undefined}
        onClick={() => onGo(dot)}
        className="inline-flex size-7 cursor-pointer items-center justify-center">
        <span
          className={cn(
            'h-1.5 rounded-full transition-[width]',
            dot === index ? 'w-[18px] bg-text' : 'w-1.5 bg-border-strong'
          )}
        />
      </button>
    ))}
  </div>
);
