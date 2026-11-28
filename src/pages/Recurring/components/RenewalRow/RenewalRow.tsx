import { NextChangeTag, PaymentIcon } from '~/components/payments';
import { formatMoney } from '~/lib/format';
import { nextChangeLine } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { RenewalItem } from '../../recurringModel';

/* One renewal or rate end: what, when and for how much, opening the payment to check it */
export const RenewalRow = ({ item, today }: { item: RenewalItem; today: Date }) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const { payment, next } = item;

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => openEdit('recurring', { paymentId: payment.id })}
      className="-mx-2 flex min-h-16 w-[calc(100%+16px)] cursor-pointer items-center gap-3 rounded-2xl px-2 text-left hover:bg-hover">
      <PaymentIcon payment={payment} className="size-10 rounded-[13px] text-[15px]" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold">{payment.name}</span>
        <span className="mt-0.5 block text-xs font-medium text-muted">
          {nextChangeLine(payment, { next, today, money: formatMoney(payment.amount) })}
        </span>
      </span>
      <NextChangeTag next={next} today={today} form="when" />
    </button>
  );
};
