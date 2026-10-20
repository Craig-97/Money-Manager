import { ChevronRight, Repeat, Trash } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { Switch } from '~/components/ui/Switch';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { accountOf, toAccounts, updatedText } from '~/lib/accounts';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD, toPayments } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { AccountFields, panelClasses } from '../AccountFields';
import { useAccountDialog } from './useAccountDialog';

/*
 * Adding an account or changing one: a dialog on desktop, a bottom sheet on mobile. The balance is
 * first and focused. Spending accounts always count in free to spend; the one pay lands in can't
 * be deleted, and another spending account takes that over with its own switch.
 */
export const AccountDialog = () => {
  const { budget } = useBudget();
  const { today } = usePayCycle(budget?.payday);
  const accounts = toAccounts(budget?.accounts, today);
  const dialog = useAccountDialog({ budgetId: budget?.id ?? '', accounts });
  const openPayment = usePaymentDialogStore(s => s.openEdit);
  const { account, draft, errors } = dialog;

  if (!budget) return null;

  const paidIn = account
    ? toPayments(budget, today).flatMap(payment =>
        payment.kind === 'recurring' && payment.paysInto === account.id ? [payment] : []
      )
    : [];
  const title = dialog.confirming
    ? `Delete ${account?.name ?? 'account'}?`
    : account
      ? `Edit ${account.name}`
      : 'Add account';

  return (
    <Modal
      open={dialog.open}
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={title}
      initialFocusId={dialog.confirming ? undefined : 'account-balance'}
      footer={
        dialog.confirming ? (
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
                <Trash size={16} aria-hidden="true" />
                Delete
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
      {dialog.confirming && account ? (
        <p className="text-sm leading-relaxed font-medium text-muted">
          Its <span className="num font-bold text-text">{formatMoney(account.balance)}</span> comes
          off everything you have.
          {paidIn.length
            ? ` ${paidIn.map(payment => payment.name).join(' and ')} will carry on as ${paidIn.length === 1 ? 'a plain expense' : 'plain expenses'}.`
            : ''}{' '}
          This can’t be undone.
        </p>
      ) : (
        <AccountFields
          draft={draft}
          set={dialog.set}
          errors={errors}
          balanceHint={account ? `${updatedText(account, today)}.` : undefined}
          canChangeKind={dialog.canChangeKind}
          afterKind={
            dialog.showPaidInto ? (
              <div className={panelClasses}>
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span id="account-paid-into" className="text-sm font-bold">
                    Where you get paid
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {dialog.isPaidInto
                      ? 'Your pay lands here. To move it, turn this on for another account.'
                      : dialog.paidIntoMove
                        ? `Your pay goes into ${dialog.paidIntoMove.to} from your next payday. ${dialog.paidIntoMove.from} stops being where you get paid.`
                        : `Turn on if your pay goes in here instead of ${dialog.paidIntoName}.`}
                  </span>
                </span>
                <Switch
                  checked={draft.paidInto}
                  disabled={dialog.isPaidInto}
                  onCheckedChange={paidInto => dialog.set({ paidInto })}
                  aria-labelledby="account-paid-into"
                />
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
