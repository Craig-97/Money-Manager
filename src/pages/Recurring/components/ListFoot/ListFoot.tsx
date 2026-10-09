import { ListTotal } from '~/components/payments/PaymentParts';
import { cn } from '~/lib/cn';
import { formatShortDate } from '~/lib/payments';
import { Recurring } from '../../hooks';

/*
 * Under the list: how many it shows and their total. Before payday it's what's still to pay,
 * counting every date; otherwise a monthly figure with yearly payments under it.
 */
export const ListFoot = ({
  recurring,
  compact = false
}: {
  recurring: Recurring;
  compact?: boolean;
}) => {
  const { tab, listed, listedTotals, cycle, today } = recurring;
  const count = `${listed.length} ${listed.length === 1 ? 'payment' : 'payments'}`;
  const label =
    tab === 'cycle'
      ? `${count} before payday · ${formatShortDate(cycle.end, today)}`
      : tab === 'renewals'
        ? `${count} · renewing`
        : `${count} · recurring`;
  const monthly = tab !== 'cycle';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-border',
        compact ? 'mt-1 px-2.5 pt-3.5 pb-1.5' : 'mt-2.5 px-4 pt-4 pb-1 pl-5'
      )}>
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <ListTotal
        net={monthly ? listedTotals.monthly : listedTotals.stillToPay}
        perMonth={monthly}
        approx={monthly && listedTotals.averaged.length > 0}
        annual={monthly ? listedTotals.annual : 0}
        compact={compact}
      />
    </div>
  );
};
