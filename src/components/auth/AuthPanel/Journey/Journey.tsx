import { cn } from '~/lib/cn';

interface JourneyStep {
  title: string;
  description: string;
  // Shown at the end of the row, e.g. "Now"
  tag?: string;
}

interface JourneyProps {
  steps: readonly JourneyStep[];
  // The step the person is on, counting from 0
  current: number;
  // Finished steps show a tick and upcoming ones an outline (password reset), rather than
  // every step showing its number (register)
  ticked?: boolean;
}

/* The numbered steps in the brand panel, with the current one highlighted */
export const Journey = ({ steps, current, ticked = false }: JourneyProps) => (
  <ol className="relative flex flex-col gap-2.5">
    {steps.map((step, index) => (
      <li
        key={step.title}
        aria-current={index === current ? 'step' : undefined}
        className={cn(
          'flex items-center gap-3.5 rounded-[22px] bg-hero-chip px-[18px] py-3.5',
          index === current && 'bg-white/25'
        )}>
        <span
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold',
            index <= current
              ? 'bg-hero-text text-hero-bg'
              : ticked
                ? 'border-[1.5px] border-hero-muted'
                : 'bg-hero-chip'
          )}>
          {ticked && index < current ? '✓' : index + 1}
        </span>
        <span className="min-w-0 grow">
          <span className="block text-[15px] font-bold">{step.title}</span>
          <span className="mt-0.5 block text-[13px] font-medium text-hero-muted">
            {step.description}
          </span>
        </span>
        {step.tag ? <span className="text-xs font-bold text-hero-muted">{step.tag}</span> : null}
      </li>
    ))}
  </ol>
);
