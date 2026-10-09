import {
  accentTagClasses,
  PaymentLetter,
  redTagClasses,
  tagClasses
} from '~/components/payments/PaymentParts';
import { formatMoney } from '~/lib/format';
import { renewalLine, renewalWhen } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { RenewalItem } from '../../recurringModel';

/* One renewal: what renews, when and for how much, opening the payment to check it */
export const RenewalRow = ({ item, today }: { item: RenewalItem; today: Date }) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const { payment, renewal } = item;

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => openEdit('recurring', payment.id)}
      className="-mx-2 flex min-h-16 w-[calc(100%+16px)] cursor-pointer items-center gap-3 rounded-2xl px-2 text-left hover:bg-hover">
      <PaymentLetter payment={payment} className="size-10 rounded-[13px] text-[15px]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold">{payment.name}</span>
        <span className="mt-0.5 block truncate text-xs font-medium text-muted">
          {renewalLine(payment, renewal, today, formatMoney(payment.amount))}
        </span>
      </span>
      <span
        className={renewal.passed ? redTagClasses : renewal.soon ? accentTagClasses : tagClasses}>
        {renewalWhen(renewal)}
      </span>
    </button>
  );
};
