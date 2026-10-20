import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { Select } from '~/components/form/Select';
import { Account } from '~/lib/accounts';
import { formatPayment } from '~/lib/format';
import { categoryLabel, formatShortDate, FREQUENCY_LABELS, RecurringPayment } from '~/lib/payments';

interface SetupPaymentRowProps {
  payment: RecurringPayment;
  spending: readonly Account[];
  from: string;
  onFrom: (accountId: string) => void;
  selected: boolean;
  onToggle: () => void;
  today: Date;
}

/*
 * One recurring expense: ticked to move it with others, or given its own account. Its next date,
 * how often and category say which payment it is. The account choice wraps under it on a phone.
 */
export const SetupPaymentRow = ({
  payment,
  spending,
  from,
  onFrom,
  selected,
  onToggle,
  today
}: SetupPaymentRowProps) => {
  const checkboxId = `setup-payment-${payment.id}`;
  const details = [
    payment.dueDate ? formatShortDate(payment.dueDate, today) : null,
    FREQUENCY_LABELS[payment.frequency],
    categoryLabel(payment.category)
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border py-2.5 first:border-t-0">
      <CheckboxHitArea htmlFor={checkboxId} className="-ml-2.5">
        <Checkbox
          id={checkboxId}
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${payment.name}`}
        />
      </CheckboxHitArea>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-bold [overflow-wrap:anywhere]">{payment.name}</span>
        <span className="text-xs font-semibold text-muted">{details}</span>
      </div>
      <span className="num text-sm font-extrabold whitespace-nowrap text-expense">
        {formatPayment(payment.signedAmount)}
      </span>
      <div className="w-full pl-9 md:w-[176px] md:pl-0">
        <Select
          variant="pill"
          value={from}
          onValueChange={onFrom}
          options={spending.map(account => ({ value: account.id, label: account.name }))}
          aria-label={`Account ${payment.name} comes out of`}
          className="w-full"
        />
      </div>
    </div>
  );
};
