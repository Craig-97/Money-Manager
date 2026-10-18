import { PenLine, RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { formatDayMonth } from '~/lib/dates';
import { aprText } from '~/lib/debts';
import { DebtPayment } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { scheduleText } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';

/* The debt's figures, with buttons to update the balance or edit everything */
export const DebtDetails = ({ debt, today }: { debt: DebtPayment; today: Date }) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const checked = debt.debt.balanceUpdatedAt;
  const rows = [
    {
      label: 'Payment',
      value: `${formatMoney(debt.amount)} · ${scheduleText(debt.firstPaymentDate, { frequency: debt.frequency })}`
    },
    { label: 'APR', value: aprText(debt.debt.apr) },
    {
      label: 'Started at',
      value: debt.debt.startingBalance === null ? 'Not set' : formatMoney(debt.debt.startingBalance)
    },
    {
      label: 'Balance checked',
      value: checked
        ? formatDayMonth(checked) +
          (checked.getFullYear() === today.getFullYear() ? '' : ` ${checked.getFullYear()}`)
        : 'Not yet'
    }
  ];

  return (
    <section aria-label="Details" className="flex flex-col gap-3.5">
      <dl className="flex flex-col rounded-3xl border border-border bg-surface px-4 py-1.5">
        {rows.map(row => (
          <div key={row.label} className="flex min-h-16 items-center justify-between gap-4">
            <dt className="text-[13px] font-semibold text-muted">{row.label}</dt>
            <dd className="text-right text-[15px] font-bold">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          onClick={() =>
            openEdit('recurring', { paymentId: debt.id, asDebt: true, focusBalance: true })
          }
          className="h-[52px]">
          <RefreshCw size={16} aria-hidden="true" />
          Update balance
        </Button>
        <Button
          onClick={() => openEdit('recurring', { paymentId: debt.id, asDebt: true })}
          className="h-[52px]">
          <PenLine size={16} aria-hidden="true" />
          Edit
        </Button>
      </div>
    </section>
  );
};
