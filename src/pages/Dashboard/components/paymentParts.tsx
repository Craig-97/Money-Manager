import { Calendar, Check, Ellipsis, PenLine, Plus, Repeat, SkipForward, Trash } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { cn } from '~/lib/cn';
import { Payment } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DueInfo, PaymentTab } from '../dashboardModel';
import { Dashboard } from '../hooks';

export const tagClasses =
  'inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 text-xs font-bold whitespace-nowrap text-muted';

export const redTagClasses = cn(tagClasses, 'border-transparent bg-expense-bg text-expense');
export const greenTagClasses = cn(tagClasses, 'border-transparent bg-income-bg text-income');

/* The payment's initial, tinted by which way the money goes */
export const PaymentLetter = ({ payment, className }: { payment: Payment; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-flex shrink-0 items-center justify-center font-extrabold',
      payment.type === 'INCOME' ? 'bg-income-bg text-income' : 'bg-expense-bg text-expense',
      className
    )}>
    {(payment.name.trim().charAt(0) || '?').toUpperCase()}
  </span>
);

export const PaidTag = ({ className }: { className?: string }) => (
  <span className={cn(greenTagClasses, 'h-[22px] px-2 text-[11px]', className)}>Paid</span>
);

export const KindTag = ({ payment }: { payment: Payment }) =>
  payment.kind === 'recurring' ? (
    <span className={tagClasses}>
      <Repeat size={13} strokeWidth={2.25} aria-hidden="true" />
      Recurring
    </span>
  ) : (
    <span className={tagClasses}>
      <Calendar size={13} strokeWidth={2.25} aria-hidden="true" />
      One-off
    </span>
  );

export const StatusTag = ({ payment }: { payment: Payment }) => (
  <span
    className={cn(
      tagClasses,
      payment.state === 'skipped' && 'border-transparent bg-accent-soft text-accent-text',
      payment.state === 'paid' && 'border-transparent bg-income-bg text-income'
    )}>
    <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
    {payment.state === 'skipped' ? 'Skipped' : payment.state === 'paid' ? 'Paid' : 'Unpaid'}
  </span>
);

/* When it's due: a tag for today or overdue, otherwise the date and how far off it is */
export const DueCell = ({ due }: { due: DueInfo }) => {
  if (due.state === 'today') return <span className={redTagClasses}>Today</span>;
  if (due.state === 'overdue') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className={redTagClasses}>Overdue</span>
        <span className="text-xs font-medium text-muted">{due.label}</span>
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm font-semibold">{due.label}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{due.detail}</p>
    </div>
  );
};

export const canSkip = (payment: Payment) =>
  payment.kind === 'recurring' && payment.state === 'unpaid' && payment.dueDate !== null;

/* Edit, mark paid, skip and delete, from the row's more button */
export const PaymentMenu = ({ payment, dashboard }: { payment: Payment; dashboard: Dashboard }) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const { setPaid, skip, remove } = dashboard.actions;
  const paid = payment.state === 'paid';

  return (
    <Menu>
      <MenuTrigger>
        <IconButton aria-label={`More actions for ${payment.name}`}>
          <Ellipsis size={18} aria-hidden="true" />
        </IconButton>
      </MenuTrigger>
      <MenuContent aria-label={`Actions for ${payment.name}`}>
        <MenuItem icon={<PenLine size={16} />} onSelect={() => openEdit(payment.kind, payment.id)}>
          Edit
        </MenuItem>
        <MenuItem
          icon={<Check size={16} strokeWidth={2.5} />}
          onSelect={() => void setPaid([payment], !paid)}>
          {paid ? 'Mark as unpaid' : 'Mark as paid'}
        </MenuItem>
        {canSkip(payment) ? (
          <MenuItem icon={<SkipForward size={16} />} onSelect={() => void skip(payment)}>
            Skip this cycle
          </MenuItem>
        ) : null}
        <MenuSeparator />
        <MenuItem danger icon={<Trash size={16} />} onSelect={() => void remove([payment])}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

export const EMPTY_TEXT: Record<PaymentTab, { title: string; body: string; button: string }> = {
  upcoming: {
    title: 'Nothing due before payday',
    body: 'Add a payment and it will show here',
    button: 'Add a payment'
  },
  recurring: {
    title: 'No recurring payments yet',
    body: 'Bills and subscriptions that repeat will show here',
    button: 'Add recurring payment'
  },
  oneOff: {
    title: 'No one-off payments yet',
    body: 'A single expense or income on a date will show here',
    button: 'Add one-off payment'
  }
};

/* What the list footer says about the tab */
export const footLabel = (count: number, tab: PaymentTab, payday: string) =>
  `${count} ${count === 1 ? 'payment' : 'payments'}` +
  (tab === 'upcoming'
    ? ` before payday · ${payday}`
    : tab === 'recurring'
      ? ' · recurring'
      : ' · one-off');

export const EmptyPayments = ({ tab, onAdd }: { tab: PaymentTab; onAdd: () => void }) => (
  <div className="flex flex-col items-center gap-1.5 border-t border-border px-3 pt-7 pb-6 text-center md:px-4 md:pt-9 md:pb-8">
    <span
      aria-hidden="true"
      className="mb-2 inline-flex size-[52px] items-center justify-center rounded-[18px] bg-accent-soft text-accent-text">
      <Calendar size={24} />
    </span>
    <p className="text-base font-extrabold tracking-[-0.01em]">{EMPTY_TEXT[tab].title}</p>
    <p className="mb-2.5 text-[13px] font-medium text-muted">{EMPTY_TEXT[tab].body}</p>
    <Button variant="accent" onClick={onAdd}>
      <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
      {EMPTY_TEXT[tab].button}
    </Button>
  </div>
);
