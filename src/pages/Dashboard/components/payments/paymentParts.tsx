import {
  Calendar,
  Check,
  Ellipsis,
  FastForward,
  PenLine,
  Plus,
  Repeat,
  SkipForward,
  Trash,
  Undo2
} from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { formatMoney, formatPayment } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import {
  cycleStatus,
  datesDue,
  formatShortDate,
  Payment,
  paymentChoices,
  RecurringPayment
} from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DueInfo, PaymentTab } from '../../dashboardModel';
import { Dashboard } from '../../hooks';

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

interface TimesDueProps {
  payment: Payment;
  cycle: PayCycle;
  today: Date;
  // The dates on hover and focus; left out where the row itself is the button
  hint?: boolean;
}

/*
 * "×2" by the name of a payment the upcoming list shows once but that's due more than once before
 * payday, such as a weekly one. Nothing for a payment due once.
 */
export const TimesDue = ({ payment, cycle, today, hint = true }: TimesDueProps) => {
  const dates = datesDue(payment, cycle);
  if (dates.length < 2) return null;
  const badge = (
    <span
      tabIndex={hint ? 0 : undefined}
      className={cn(tagClasses, 'h-[22px] shrink-0 px-2 num text-[11px]')}>
      <span aria-hidden="true">×{dates.length}</span>
      <span className="sr-only">, due {dates.length} times before payday</span>
    </span>
  );
  const label = (
    <>
      <span className="font-bold">Due {dates.length} times before payday</span>
      {dates.map(date => (
        <span
          key={date.getTime()}
          className={cn(
            'num font-bold',
            payment.signedAmount < 0 ? 'text-expense' : 'text-income'
          )}>
          {formatShortDate(date, today)} {formatPayment(payment.signedAmount)}
        </span>
      ))}
    </>
  );
  return hint ? (
    <Tooltip label={label} side="top" tone="card">
      {badge}
    </Tooltip>
  ) : (
    badge
  );
};

/* Where a recurring payment stands this cycle: "Unpaid", "1 of 4 paid", "Paid"... */
export const StatusTag = ({ payment, cycle }: { payment: RecurringPayment; cycle: PayCycle }) => {
  const { tone, label } = cycleStatus(payment, cycle);
  return (
    <span
      className={cn(
        tagClasses,
        tone === 'skipped' && 'border-transparent bg-accent-soft text-accent-text',
        tone === 'paid' && 'border-transparent bg-income-bg text-income'
      )}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

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

/* Edit, pay, undo, skip and delete, from the row's more button */
export const PaymentMenu = ({ payment, dashboard }: { payment: Payment; dashboard: Dashboard }) => {
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const { pay, undo, skip, remove } = dashboard.actions;
  const choices = paymentChoices(payment, dashboard.cycle, dashboard.today);
  const recurring = payment.kind === 'recurring' ? payment : null;

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
        {choices.pay ? (
          <MenuItem
            icon={<Check size={16} strokeWidth={2.5} />}
            onSelect={() => void pay([payment])}>
            {choices.pay}
          </MenuItem>
        ) : null}
        {recurring && choices.undo ? (
          <MenuItem icon={<Undo2 size={16} />} onSelect={() => void undo(recurring)}>
            {choices.undo}
          </MenuItem>
        ) : null}
        {recurring && choices.skipNext ? (
          <MenuItem icon={<SkipForward size={16} />} onSelect={() => void skip(recurring)}>
            {choices.skipNext}
          </MenuItem>
        ) : null}
        {recurring && choices.skipRest ? (
          <MenuItem
            icon={<FastForward size={16} />}
            onSelect={() => void skip(recurring, dashboard.cycle.end)}>
            {choices.skipRest}
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

/*
 * The list's total. On the recurring tab it's a monthly figure, "≈" when weekly or fortnightly
 * payments count at their average, with quarterly and yearly payments as a yearly figure under it.
 */
export const ListTotal = ({
  dashboard,
  compact = false
}: {
  dashboard: Dashboard;
  compact?: boolean;
}) => {
  const { tab, listedNet, summary } = dashboard;
  const recurring = tab === 'recurring';

  return (
    <div className="flex flex-col items-end gap-0.5">
      <p className="flex items-baseline gap-2.5">
        {compact ? null : <span className="text-[13px] font-semibold text-muted">Net total</span>}
        <span
          className={cn(
            'num font-extrabold',
            compact ? 'text-lg' : 'text-xl',
            listedNet >= 0 ? 'text-income' : 'text-expense'
          )}>
          {recurring && summary.averagedRecurring.length ? (
            <span className="text-muted">≈ </span>
          ) : null}
          {formatPayment(listedNet)}
          {recurring ? <span className="text-sm font-semibold text-muted"> /mo</span> : null}
        </span>
      </p>
      {recurring && summary.annualRecurring > 0 ? (
        <p className="text-xs font-medium text-muted">
          + <span className="num font-bold text-text">{formatMoney(summary.annualRecurring)}</span>{' '}
          /yr
        </p>
      ) : null}
    </div>
  );
};
