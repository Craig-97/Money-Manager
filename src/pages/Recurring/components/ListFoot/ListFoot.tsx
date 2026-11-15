import { ListTotal, PaymentListFoot } from '~/components/payments';
import { formatShortDate } from '~/lib/dates';
import { plural } from '~/lib/format';
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
  const count = plural(listed.length, 'payment');
  const label =
    tab === 'cycle'
      ? `${count} before payday · ${formatShortDate(cycle.end, today)}`
      : tab === 'renewals'
        ? `${count} · renewing`
        : `${count} · recurring`;
  const monthly = tab !== 'cycle';

  return (
    <PaymentListFoot label={label} compact={compact}>
      <ListTotal
        net={monthly ? listedTotals.monthly : listedTotals.stillToPay}
        perMonth={monthly}
        approx={monthly && listedTotals.averaged.length > 0}
        annual={monthly ? listedTotals.annual : 0}
        compact={compact}
      />
    </PaymentListFoot>
  );
};
