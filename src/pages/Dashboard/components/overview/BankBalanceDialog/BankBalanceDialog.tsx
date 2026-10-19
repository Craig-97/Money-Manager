import { AmountInput } from '~/components/form/AmountInput';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { accountLetter, isStale, updatedText } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { BankBalanceDialog as Dialog } from '../../../hooks/useBankBalanceDialog';

/*
 * The bank balance once it's made of more than one account: each one's balance to check against
 * the bank, and what they come to. A dialog on desktop, a sheet on mobile.
 */
export const BankBalanceDialog = ({ dialog, today }: { dialog: Dialog; today: Date }) => (
  <Modal
    open={dialog.open}
    onOpenChange={next => (next ? undefined : dialog.close())}
    title="Bank balance"
    description="The accounts that count in free to spend"
    footer={
      <>
        <PageLink
          page="accounts"
          to={ROUTES.accounts}
          className="mr-auto rounded-full px-2 py-2.5 text-[13px] font-bold text-accent-text hover:underline">
          Manage accounts
        </PageLink>
        <Button variant="ghost" onClick={dialog.close} className="max-md:h-[52px]">
          Cancel
        </Button>
        <Button
          variant="accent"
          onClick={dialog.save}
          disabled={!dialog.valid}
          loading={dialog.saving}
          className="max-md:h-[52px]">
          Save
        </Button>
      </>
    }>
    <div className="flex flex-col gap-2">
      {dialog.rows.map(({ account, value, setValue }) => (
        <div
          key={account.id}
          className="flex items-center gap-2.5 rounded-[18px] border border-border bg-surface-2 py-2.5 pr-2.5 pl-3.5 md:gap-3 md:pl-3">
          <span
            aria-hidden="true"
            className="hidden size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-sm font-extrabold md:inline-flex">
            {accountLetter(account)}
          </span>
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <label htmlFor={`balance-${account.id}`} className="text-sm font-bold">
              {account.name}
            </label>
            <span
              className={cn(
                'text-xs font-semibold',
                isStale(account, today) ? 'text-warn' : 'text-muted'
              )}>
              {updatedText(account, today)}
            </span>
          </span>
          <AmountInput
            id={`balance-${account.id}`}
            value={value}
            onChange={event => setValue(event.target.value)}
            boxClassName="w-[148px] shrink-0 md:w-[168px]"
          />
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between gap-3 border-t border-border px-1 pt-3">
      <span className="text-[13px] font-bold text-muted">Counts as your bank balance</span>
      <span className="num text-lg font-extrabold">{formatBalance(dialog.total)}</span>
    </div>
  </Modal>
);
