import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { Select } from '~/components/form/Select';
import { Account, accountLetter } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { categoryLabel, formatShortDate, FREQUENCY_LABELS, RecurringPayment } from '~/lib/payments';

interface SetupPaymentRowProps {
  payment: RecurringPayment;
  spending: readonly Account[];
  // The account it comes from, and where pay lands, which its option says
  from: string;
  paidInto: string;
  onFrom: (accountId: string) => void;
  selected: boolean;
  onToggle: () => void;
  today: Date;
  // Mobile: one line, the amount moved under the name and a narrower picker
  compact: boolean;
}

/*
 * One recurring expense: ticked to move it with others, or given its own account. Its next date,
 * how often and category say which payment it is. Each account in the picker says what it's for,
 * or that it's where you get paid.
 */
export const SetupPaymentRow = ({
  payment,
  spending,
  from,
  paidInto,
  onFrom,
  selected,
  onToggle,
  today,
  compact
}: SetupPaymentRowProps) => {
  const checkboxId = `setup-payment-${payment.id}`;
  const date = payment.dueDate ? formatShortDate(payment.dueDate, today) : null;
  const details = compact
    ? [date, formatMoney(payment.amount), categoryLabel(payment.category)]
    : [date, FREQUENCY_LABELS[payment.frequency], categoryLabel(payment.category)];

  return (
    <div
      role="listitem"
      className={cn(
        'flex items-center rounded-2xl transition-colors',
        compact ? 'min-h-16 gap-1.5 py-1.5 pr-1.5' : 'min-h-[68px] gap-2.5 py-1.5 pr-2',
        selected && 'bg-accent-soft'
      )}>
      <CheckboxHitArea htmlFor={checkboxId}>
        <Checkbox
          id={checkboxId}
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${payment.name}`}
        />
      </CheckboxHitArea>
      {compact ? null : (
        <span
          aria-hidden="true"
          className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
          {accountLetter(payment)}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-bold [overflow-wrap:anywhere]">{payment.name}</span>
        <span className="num text-xs font-semibold text-muted">
          {details.filter(Boolean).join(' · ')}
        </span>
      </div>
      {compact ? null : (
        <span className="w-[100px] shrink-0 text-right num text-[15px] font-extrabold whitespace-nowrap">
          {formatMoney(payment.amount)}
        </span>
      )}
      <div className={cn('shrink-0', compact ? 'w-[132px]' : 'w-[190px]')}>
        <Select
          variant="pill"
          value={from}
          onValueChange={onFrom}
          options={spending.map(account => ({
            value: account.id,
            label: account.name,
            description:
              account.id === paidInto ? 'Where you get paid' : (account.purpose ?? 'Spending')
          }))}
          aria-label={`${payment.name} comes from`}
          className={cn(
            'w-full',
            // A long name wraps in the narrow phone picker rather than being cut short
            compact
              ? 'h-auto min-h-11 py-1.5 pr-3 pl-3.5 text-left leading-tight [&>span:first-child]:overflow-visible [&>span:first-child]:whitespace-normal'
              : 'text-sm'
          )}
        />
      </div>
    </div>
  );
};
