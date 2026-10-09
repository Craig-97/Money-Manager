import { Tooltip } from '~/components/ui/Tooltip';
import { formatMoney } from '~/lib/format';
import { CategoryShare } from '../../recurringModel';

const percent = (share: number) => `${Math.round(share * 100)}%`;

/* Money out by category as one bar, a slice each. Hovering or focusing a slice names it. */
export const CategoryBar = ({ spending }: { spending: CategoryShare[] }) => (
  <div
    role="group"
    aria-label="Yearly spend by category"
    className="group flex h-7 items-center gap-[3px]">
    {spending.map(item => (
      <Tooltip
        key={item.category}
        side="top"
        tone="card"
        label={
          <>
            <span className="font-bold">{item.label}</span>
            <span>
              <span className="num font-bold">{formatMoney(item.yearly)}</span> a year ·{' '}
              {percent(item.share!)}
            </span>
          </>
        }>
        <span
          tabIndex={0}
          aria-label={`${item.label}, ${formatMoney(item.yearly)} a year, ${percent(item.share!)}`}
          style={{ flex: `${item.share} 1 0` }}
          className="group/slice flex h-full min-w-1.5 items-center rounded-md outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent">
          {/* Hovering the bar fades the other slices */}
          <span
            className="block h-3.5 w-full rounded transition-opacity group-hover:opacity-35 group-hover/slice:opacity-100 group-focus-visible/slice:opacity-100"
            style={{ background: item.colour! }}
          />
        </span>
      </Tooltip>
    ))}
  </div>
);
