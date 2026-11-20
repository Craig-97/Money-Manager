import { DateBox } from '~/components/ui';
import { AccountBeforePayday } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { categoryLabel, FREQUENCY_LABELS } from '~/lib/payments';
import { usePaymentSheetStore } from '~/state/paymentSheet';

interface BeforePaydayPaymentProps {
  item: AccountBeforePayday['movements'][number];
  // On payday itself, so it counts in the next cycle: set off by a dashed rule, its amount muted
  onPayday?: boolean;
  // Across a wide row, its amount lined up under the account's sum
  across: boolean;
}

// The line under a payment: how often, what it's for, and the account at the other end of money
// moving. "Monthly · Utilities · To Joint bills"
const detailsOf = (item: BeforePaydayPaymentProps['item']) =>
  [
    item.payment.kind === 'oneOff' ? 'One-off' : FREQUENCY_LABELS[item.payment.frequency],
    categoryLabel(item.payment.category),
    item.other ? (item.amount < 0 ? `To ${item.other.name}` : `From ${item.other.name}`) : null
  ]
    .filter(Boolean)
    .join(' · ');

/*
 * One payment in an account's list before payday, opening the payment as the dashboard's rows do.
 * Its hover runs a little past the text, as Renewals' rows do.
 */
export const BeforePaydayPayment = ({
  item,
  onPayday = false,
  across
}: BeforePaydayPaymentProps) => {
  const openSheet = usePaymentSheetStore(s => s.openFor);
  const size = across ? 'text-[15px]' : 'text-sm';

  return (
    <li
      className={
        onPayday ? 'mt-1.5 border-t border-dashed border-border-strong pt-1.5' : undefined
      }>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => openSheet(item.payment.id)}
        className={cn(
          '-mx-2 flex w-[calc(100%+16px)] cursor-pointer items-center rounded-2xl px-2 py-1.5 text-left transition-colors hover:bg-hover',
          across ? 'gap-3.5' : 'gap-3',
          !onPayday && (across ? 'min-h-16' : 'min-h-[60px]')
        )}>
        <DateBox date={item.date} top="weekday" accent={onPayday} size={across ? 'md' : 'sm'} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={cn('font-bold [overflow-wrap:anywhere]', size)}>
            {item.payment.name}
          </span>
          <span className="text-xs leading-[1.35] font-semibold text-muted">{detailsOf(item)}</span>
        </span>
        {onPayday ? (
          <span className={cn('flex shrink-0 flex-col items-end gap-1', across && 'w-[130px]')}>
            <span className={cn('num font-extrabold whitespace-nowrap text-muted', size)}>
              {formatPayment(item.amount)}
            </span>
            <span className="inline-flex h-5 items-center rounded-full border border-border bg-surface-2 px-2 text-[10px] font-bold whitespace-nowrap text-muted">
              Next cycle
            </span>
          </span>
        ) : (
          <span
            className={cn(
              'shrink-0 num font-extrabold whitespace-nowrap',
              size,
              across && 'w-[130px] text-right',
              item.amount < 0 ? 'text-expense' : 'text-income'
            )}>
            {formatPayment(item.amount)}
          </span>
        )}
        {/* Under the account's chevron, so the amounts line up with its sum */}
        {across ? <span aria-hidden="true" className="w-8 shrink-0" /> : null}
      </button>
    </li>
  );
};
