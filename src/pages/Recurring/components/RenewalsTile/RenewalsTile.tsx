import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { Recurring } from '../../hooks';
import { RenewalRow } from '../RenewalRow';

/*
 * The soonest few renewals, over a window that fits them: the next month when several are close,
 * up to two years when they're spread out. The rest are a click away in the table's Renewals tab.
 */
export const RenewalsTile = ({
  recurring,
  compact = false
}: {
  recurring: Recurring;
  compact?: boolean;
}) => {
  const { renewals, today } = recurring;
  const { shown, total, label } = renewals;

  return (
    <section
      aria-labelledby="renewals-title"
      className={cn(
        'flex flex-col rounded-3xl border border-border bg-surface',
        compact ? 'p-3' : cn(tileLift, 'p-5')
      )}>
      <div className="flex min-h-10 items-baseline justify-between gap-3 px-1 pb-1">
        <h2
          id="renewals-title"
          className={cn(
            'font-extrabold tracking-[-0.02em]',
            compact ? 'text-base' : 'text-[19px]'
          )}>
          Renewals coming up
        </h2>
        {label ? (
          <span className="text-xs font-semibold text-muted">
            {shown.length < total ? `Soonest ${shown.length} of ${total} · ${label}` : label}
          </span>
        ) : null}
      </div>
      {total === 0 ? (
        <p className="px-1 pt-2 pb-4 text-[13px] font-medium text-muted">
          No renewals set. Choose Renews when you add or edit a policy or contract.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-0.5 px-1">
            {shown.map(item => (
              <RenewalRow key={item.payment.id} item={item} today={today} />
            ))}
          </div>
          <div className="mt-auto flex border-t border-border pt-2.5">
            <button
              type="button"
              onClick={recurring.showRenewals}
              className="inline-flex h-11 cursor-pointer items-center rounded-full px-3 text-[13px] font-bold text-accent-text hover:bg-hover">
              {total > shown.length ? `View all ${total} renewals` : 'View in payments'}
            </button>
          </div>
        </>
      )}
    </section>
  );
};
