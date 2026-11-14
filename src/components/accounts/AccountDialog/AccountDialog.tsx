import { ArrowRight, ChevronRight, Repeat } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { Switch } from '~/components/ui/Switch';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import {
  accountLetter,
  accountOf,
  isStale,
  spendingOf,
  toAccounts,
  updatedText
} from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatShortDate } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD, toPayments } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { AccountChooser } from '../AccountChooser';
import { AccountFields, panelClasses } from '../AccountFields';
import { deleteTextOf } from './deleteText';
import { useAccountDialog } from './useAccountDialog';
import { accountDialogTitle } from '../accountDraft';

/*
 * Adding an account or changing one: a dialog on desktop, a bottom sheet on mobile. Adding starts
 * with Spending or Savings. The balance is first and focused, with how old it is under the title. The account pay lands in always counts in
 * free to spend and can't be deleted; another spending account takes that over with its own switch.
 */
export const AccountDialog = () => {
  const { budget } = useBudget();
  const { today, holidays, cycle } = usePayCycle(budget?.payday);
  const accounts = toAccounts(budget?.accounts, today);
  const dialog = useAccountDialog({ budgetId: budget?.id ?? '', accounts, today });
  const openPayment = usePaymentDialogStore(s => s.openEdit);
  const { account, draft, errors } = dialog;

  if (!budget) return null;

  const payments = account ? toPayments(budget, { today, holidays }) : [];
  // Payments that move money into it, under its switch when editing
  const paidIn = payments.flatMap(payment =>
    payment.kind === 'recurring' && payment.paysInto === account?.id ? [payment] : []
  );
  // Deleting: payments that go out of or into it move to where you get paid
  const movesText = account
    ? deleteTextOf({
        moving: payments.filter(payment => payment.account === account.id),
        paidIntoName: dialog.paidIntoName ?? 'where you get paid',
        // With two or more left to spend from, they can still be moved to another
        canMove: spendingOf(accounts).filter(item => item.id !== account.id).length > 1
      })
    : null;
  const title = dialog.confirming
    ? `Delete ${account?.name ?? 'account'}?`
    : accountDialogTitle(draft.kind, { editing: account?.name, choosing: dialog.choosing });

  return (
    <Modal
      open={dialog.open}
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={title}
      onBack={!account && !dialog.choosing ? dialog.backToChooser : undefined}
      backLabel="Back to account types"
      leading={
        account && !dialog.confirming ? (
          <span
            aria-hidden="true"
            className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
            {accountLetter(account)}
          </span>
        ) : undefined
      }
      subtitle={
        account && !dialog.confirming ? (
          <span
            className={cn(
              'text-xs font-bold',
              isStale(account, today) ? 'text-warn' : 'text-muted'
            )}>
            {updatedText(account, today)}
          </span>
        ) : undefined
      }
      initialFocusId={dialog.confirming || dialog.choosing ? undefined : 'account-balance'}
      footer={
        dialog.choosing ? undefined : dialog.confirming ? (
          <>
            <span className="flex-1" />
            <Button variant="ghost" onClick={dialog.keep} className="max-md:h-[52px]">
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={dialog.confirmDelete}
              loading={dialog.deleting}
              className="max-md:h-[52px]">
              Delete account
            </Button>
          </>
        ) : (
          <>
            {dialog.canDelete ? (
              <Button variant="dangerGhost" onClick={dialog.askDelete} className="max-md:-ml-2">
                Delete account
              </Button>
            ) : null}
            <span className="flex-1" />
            <Button variant="ghost" onClick={dialog.close} className="max-md:h-[52px]">
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={dialog.save}
              loading={dialog.saving}
              className="max-md:h-[52px]">
              {account ? 'Save' : 'Add account'}
            </Button>
          </>
        )
      }>
      {dialog.choosing ? (
        <AccountChooser onChoose={dialog.chooseKind} />
      ) : dialog.confirming && account ? (
        <div className="flex flex-col gap-2.5 text-sm leading-relaxed font-medium text-muted">
          <p>
            The app stops tracking its{' '}
            <span className="num font-bold text-text">{formatMoney(account.balance)}</span>, so it
            no longer counts towards{' '}
            {account.counts ? 'what you have or free to spend' : 'what you have'}.
          </p>
          {movesText ? <p>{movesText}</p> : null}
          <p>This can’t be undone.</p>
        </div>
      ) : (
        <AccountFields
          key={dialog.opened}
          draft={draft}
          today={today}
          set={dialog.set}
          errors={errors}
          // A new account's type was chosen first; an existing one's can change under More options
          canChangeKind={!!account && dialog.canChangeKind}
          editing={!!account}
          showCounts={dialog.showCounts}
          afterKind={
            dialog.showPaidInto ? (
              <div
                className={cn(
                  panelClasses,
                  'flex-col items-stretch gap-3',
                  dialog.paidIntoMove && 'border-accent'
                )}>
                <div className="flex items-center gap-3">
                  <span className="flex min-w-0 grow flex-col gap-0.5">
                    <span id="account-paid-into" className="text-sm font-bold">
                      Where you get paid
                    </span>
                    <span className="text-xs leading-[1.4] font-semibold text-muted">
                      {dialog.isPaidInto
                        ? 'Your pay goes in here, so it always counts in free to spend. To move it, switch it on for another spending account.'
                        : 'Your pay goes in here, and it always counts in free to spend. Only one account can be.'}
                    </span>
                  </span>
                  <Switch
                    checked={draft.paidInto}
                    disabled={dialog.isPaidInto}
                    onCheckedChange={paidInto => dialog.set({ paidInto })}
                    aria-labelledby="account-paid-into"
                  />
                </div>
                {dialog.paidIntoMove ? (
                  <p
                    aria-live="polite"
                    className="flex items-start gap-2.5 border-t border-border pt-3 text-[13px] leading-[1.45] font-semibold">
                    <ArrowRight
                      size={16}
                      className="mt-px shrink-0 text-accent-text"
                      aria-hidden="true"
                    />
                    <span>
                      Your pay goes into {dialog.paidIntoMove.to} from{' '}
                      {formatShortDate(cycle.end, today)}. {dialog.paidIntoMove.from} stops being
                      where you get paid.
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null
          }
          beforeCounts={paidIn.map(payment => (
            <button
              key={payment.id}
              type="button"
              onClick={() => {
                dialog.close();
                openPayment('recurring', { paymentId: payment.id });
              }}
              className={`${panelClasses} cursor-pointer text-left hover:border-border-strong`}>
              <span
                aria-hidden="true"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted">
                <Repeat size={16} />
              </span>
              <span className="flex min-w-0 grow flex-col gap-0.5">
                <span className="text-sm font-bold">
                  Paid in from {accountOf(payment, accounts)?.name ?? 'your account'}
                </span>
                <span className="text-xs font-semibold text-muted">
                  {payment.name} · {formatMoney(payment.amount)} {PER_PERIOD[payment.frequency]}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
            </button>
          ))}
        />
      )}
    </Modal>
  );
};
