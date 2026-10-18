import { cn } from '~/lib/cn';

interface PayoffChartProps {
  // What's left at the start and after each month, as things are and with the plan
  base: number[];
  plan: number[];
  // Read out in place of the chart
  label: string;
  // Under the chart on desktop: "Oct 2026 · £10,000" and the month the slower line ends
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

const HEIGHT = 160;

/* The total left falling month by month: the plan as a solid line, as things are dashed */
export const PayoffChart = ({
  base,
  plan,
  label,
  startLabel,
  endLabel,
  className
}: PayoffChartProps) => {
  const months = Math.max(base.length, plan.length, 2) - 1;
  const top = Math.max(base[0] ?? 0, plan[0] ?? 0, 1);
  const path = (series: number[]) =>
    series
      .map(
        (value, i) =>
          `${i ? 'L' : 'M'}${((i / months) * 1000).toFixed(1)} ${(HEIGHT - 6 - (value / top) * (HEIGHT - 16)).toFixed(1)}`
      )
      .join(' ');

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 1000 ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible">
        <line
          x1="0"
          x2="1000"
          y1={HEIGHT - 6}
          y2={HEIGHT - 6}
          className="stroke-border [stroke-width:1] [vector-effect:non-scaling-stroke]"
        />
        <path
          d={path(base)}
          className="fill-none stroke-faint [stroke-width:2] [stroke-dasharray:6_6] [vector-effect:non-scaling-stroke]"
        />
        <path
          d={path(plan)}
          className="fill-none stroke-accent [stroke-width:3] [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]"
        />
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs font-semibold text-muted">
        {startLabel ? <span className="num">{startLabel}</span> : null}
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-[3px] w-3.5 rounded-full bg-accent" />
            This plan
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="w-3.5 border-t-2 border-dashed border-faint" />
            As you are now
          </span>
        </span>
        {endLabel ? <span className="num">{endLabel}</span> : null}
      </div>
    </div>
  );
};
