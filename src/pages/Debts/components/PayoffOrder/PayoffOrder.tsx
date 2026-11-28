import { PayoffPlan } from '../../hooks';

/* The debts in the order the plan clears them, with when */
export const PayoffOrder = ({ plan }: { plan: PayoffPlan }) => (
  <ol className="flex flex-col gap-1">
    {plan.figures.order.map((item, index) => (
      <li key={item.id} className="flex min-h-11 items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent-text">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-bold [overflow-wrap:anywhere] md:truncate">
          {item.name}
        </span>
        <span className="text-[13px] font-semibold text-muted">
          {item.when === 'Never' ? 'Not at this payment' : `Cleared ${item.when}`}
        </span>
      </li>
    ))}
  </ol>
);
