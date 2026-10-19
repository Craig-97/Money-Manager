import { ChevronRight, Repeat, Trash } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { Switch } from '~/components/ui/Switch';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { toAccounts, updatedText } from '~/lib/accounts';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD, toPayments } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { useAccountDialog } from './useAccountDialog';

const helpClasses = 'mt-2 ml-1 text-xs font-semibold text-muted';
const panelClasses =
  'flex items-center gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3.5';

/*
 * Adding a savings account or changing one: a dialog on desktop, a bottom sheet on mobile. The
 * balance is first and focused. The current account always counts and can't be deleted.
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
      : 'Add savings account';

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
            {account && !dialog.isCurrent ? (
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
        <>
          <div>
            <Label tone="muted" htmlFor="account-balance">
              Balance now
            </Label>
            <AmountInput
              id="account-balance"
              size="hero"
              value={draft.balance}
              onChange={event => dialog.set({ balance: event.target.value })}
              placeholder="0.00"
              invalid={!!errors.balance}
              aria-describedby={errors.balance ? 'account-balance-error' : 'account-balance-help'}
            />
            {errors.balance ? (
              <FieldError id="account-balance-error">{errors.balance}</FieldError>
            ) : (
              <p id="account-balance-help" className={helpClasses}>
                Check your banking app and type what it says.
                {account ? ` ${updatedText(account, today)}.` : ''}
              </p>
            )}
          </div>

          <div>
            <Label tone="muted" htmlFor="account-name">
              Name
            </Label>
            <TextInput
              id="account-name"
              value={draft.name}
              onChange={event => dialog.set({ name: event.target.value })}
              placeholder="e.g. Easy access"
              maxLength={50}
              autoComplete="off"
              invalid={!!errors.name}
              aria-describedby={errors.name ? 'account-name-error' : undefined}
            />
            {errors.name ? <FieldError id="account-name-error">{errors.name}</FieldError> : null}
          </div>

          {dialog.isCurrent ? null : (
            <>
              <div className="grid gap-[18px] md:grid-cols-2">
                <div>
                  <Label tone="muted" htmlFor="account-rate">
                    Interest rate (optional)
                  </Label>
                  <TextInput
                    id="account-rate"
                    inputMode="decimal"
                    value={draft.interestRate}
                    onChange={event => dialog.set({ interestRate: event.target.value })}
                    placeholder="e.g. 4.5"
                    autoComplete="off"
                    suffix={<span className="pr-1 font-bold text-muted">%</span>}
                    invalid={!!errors.interestRate}
                    aria-describedby={errors.interestRate ? 'account-rate-error' : undefined}
                  />
                  {errors.interestRate ? (
                    <FieldError id="account-rate-error">{errors.interestRate}</FieldError>
                  ) : null}
                </div>
                <div>
                  <Label tone="muted" htmlFor="account-purpose">
                    What it’s for (optional)
                  </Label>
                  <TextInput
                    id="account-purpose"
                    value={draft.purpose}
                    onChange={event => dialog.set({ purpose: event.target.value })}
                    placeholder="e.g. Holiday fund"
                    maxLength={60}
                    autoComplete="off"
                    invalid={!!errors.purpose}
                    aria-describedby={errors.purpose ? 'account-purpose-error' : undefined}
                  />
                  {errors.purpose ? (
                    <FieldError id="account-purpose-error">{errors.purpose}</FieldError>
                  ) : null}
                </div>
              </div>

              {paidIn.map(payment => (
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
                    <span className="text-sm font-bold">Paid in from your current account</span>
                    <span className="text-xs font-semibold text-muted">
                      {payment.name} · {formatMoney(payment.amount)} {PER_PERIOD[payment.frequency]}
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
                </button>
              ))}

              <div className={panelClasses}>
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span id="account-counts" className="text-sm font-bold">
                    Count in free to spend
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {draft.counts
                      ? 'Adds to the bank balance on your dashboard'
                      : 'Kept out of free to spend. Money you’ve put aside isn’t money to spend.'}
                  </span>
                </span>
                <Switch
                  checked={draft.counts}
                  onCheckedChange={counts => dialog.set({ counts })}
                  aria-labelledby="account-counts"
                />
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
};
