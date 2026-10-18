import { ArrowUp, Info } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { accentTagClasses, greenTagClasses, tagClasses } from '~/components/payments/PaymentParts';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { Skeleton } from '~/components/ui/Skeleton';
import { useDebtHistory } from '~/hooks/useDebtHistory';
import { cn } from '~/lib/cn';
import { formatShortDay } from '~/lib/dates';
import { DebtPayment, HistoryEntry, paidOffShare, startedAt } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { useDebtDialogStore } from '~/state/debtDialog';
import { ShowOlderPayments } from '../ShowOlderPayments';

interface PaymentsDialogProps {
  debts: readonly DebtPayment[];
  today: Date;
  onUndoOverpayment: (recordId: string, name: string) => void;
}

const TAGS: Record<HistoryEntry['kind'], string> = {
  due: accentTagClasses,
  paid: tagClasses,
  skipped: tagClasses,
  overpayment: greenTagClasses,
  balance: tagClasses
};

const columns = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_100px_110px] items-center gap-x-3';

/*
 * Desktop: a debt's payments, newest first and by month, with the balance after each. The column
 * headings stay at the top as the payments scroll, and older ones load on asking.
 */
export const PaymentsDialog = ({ debts, today, onUndoOverpayment }: PaymentsDialogProps) => {
  const { dialog, close, openOverpayment } = useDebtDialogStore(
    useShallow(s => ({ dialog: s.dialog, close: s.close, openOverpayment: s.openOverpayment }))
  );
  const debt =
    dialog.view === 'payments' ? debts.find(item => item.id === dialog.debtId) : undefined;
  const history = useDebtHistory(debt, today);

  if (!debt) return null;
  const paid = startedAt(debt) - debt.debt.balance;

  return (
    <Modal
      open
      wide
      onOpenChange={next => (next ? undefined : close())}
      title={`${debt.name} payments`}
      footer={
        <>
          <Button onClick={() => openOverpayment(debt.id)}>
            <ArrowUp size={16} aria-hidden="true" />
            Log an overpayment
          </Button>
          <span className="flex-1" />
          <Button variant="accent" onClick={close}>
            Done
          </Button>
        </>
      }>
      <p className="-mt-2 text-[13px] font-semibold text-muted">
        <span className="num font-extrabold text-text">{formatMoney(debt.debt.balance)}</span> left
        · {formatMoney(paid, { whole: true })} paid off · {Math.round(paidOffShare(debt) * 100)}%
      </p>
      <div role="table" aria-label="Payments" className="flex flex-col">
        <div
          role="row"
          // Stays put while the payments scroll under it
          className={cn(
            columns,
            'sticky -top-2.5 z-1 min-h-10 border-b border-border bg-surface px-2 text-xs font-bold tracking-[0.04em] text-muted uppercase'
          )}>
          <span role="columnheader">Date</span>
          <span role="columnheader">What</span>
          <span role="columnheader" className="text-right">
            Amount
          </span>
          <span role="columnheader" className="text-right">
            Balance after
          </span>
        </div>
        {history.loading
          ? [0, 1, 2].map(row => (
              <div key={row} className={cn(columns, 'min-h-[52px] px-2')}>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="ml-auto h-4 w-16" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))
          : history.months.map(month => (
              <div key={month.label} role="rowgroup" aria-label={month.label} className="pt-1.5">
                <p aria-hidden="true" className="px-2 pt-2 pb-1 text-xs font-bold text-muted">
                  {month.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {month.entries.map(entry => (
                    <div
                      key={entry.id}
                      role="row"
                      className={cn(columns, 'min-h-[52px] rounded-2xl px-2 hover:bg-hover')}>
                      <span role="cell" className="text-sm font-bold">
                        {formatShortDay(entry.date)}
                      </span>
                      <span role="cell" className="flex items-center gap-1.5">
                        <span className={TAGS[entry.kind]}>{entry.label}</span>
                        {entry.undoable ? (
                          <button
                            type="button"
                            onClick={() => onUndoOverpayment(entry.id, debt.name)}
                            className="cursor-pointer rounded-full px-2 py-1 text-xs font-bold text-accent-text hover:bg-hover">
                            Undo
                          </button>
                        ) : null}
                      </span>
                      <span
                        role="cell"
                        className={cn(
                          'text-right num text-sm font-extrabold',
                          entry.kind === 'overpayment' && 'text-income'
                        )}>
                        {entry.amount === null ? '—' : formatMoney(entry.amount)}
                      </span>
                      <span role="cell" className="text-right num text-sm font-bold text-muted">
                        {entry.balanceAfter === null
                          ? '—'
                          : `${entry.kind === 'due' ? '≈ ' : ''}${formatMoney(entry.balanceAfter, { whole: true })}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
      </div>
      {history.hasMore ? (
        <ShowOlderPayments onClick={history.showMore} loading={history.loadingMore} />
      ) : null}
      <p className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3.5 text-[13px] leading-normal text-muted">
        <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Balances after each payment are worked out from your APR.{' '}
          <b className="text-text">Update balance</b> from a statement whenever you want them exact.
        </span>
      </p>
    </Modal>
  );
};
