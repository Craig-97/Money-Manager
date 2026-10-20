import { Radio } from '~/components/form/Radio';
import { Select } from '~/components/form/Select';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { toAccounts } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { RecurringPayment, toPayments } from '~/lib/payments';
import { SetupPaymentRow } from './components';
import { useSetupAccounts } from './useSetupAccounts';

const questionClasses = 'text-[15px] font-extrabold tracking-[-0.01em]';
const hintClasses = 'mt-1 text-xs font-semibold text-muted';

/*
 * "Set up your accounts", once there's more than one account to spend from: where pay lands, then
 * which account each recurring expense goes out of. A dialog on desktop, a sheet on mobile. Ticking
 * payments shows a bar in the footer to move them together.
 */
export const SetupAccountsDialog = () => {
  const { budget } = useBudget();
  const { today } = usePayCycle(budget?.payday);
  const accounts = toAccounts(budget?.accounts, today);
  const payments = budget
    ? toPayments(budget, today).filter(
        (payment): payment is RecurringPayment =>
          payment.kind === 'recurring' && payment.type === 'EXPENSE'
      )
    : [];
  const setup = useSetupAccounts({ budgetId: budget?.id ?? '', accounts, payments });

  if (!budget) return null;
  const count = setup.selected.size;

  return (
    <Modal
      open={setup.open}
      onOpenChange={next => (next ? undefined : setup.close())}
      title="Set up your accounts"
      description="Where your pay lands, and which account each payment comes out of"
      wide
      footer={
        <div className="flex w-full flex-col gap-3">
          {count ? (
            <div className="flex flex-wrap items-center gap-2 rounded-[18px] bg-accent-soft px-3 py-2.5">
              <span className="text-sm font-bold">Move {count} to</span>
              <div className="min-w-[150px] flex-1 md:flex-none">
                <Select
                  variant="pill"
                  value={setup.moveTo?.id}
                  onValueChange={setup.setTarget}
                  options={setup.spending.map(account => ({
                    value: account.id,
                    label: account.name
                  }))}
                  aria-label="Account to move them to"
                  className="w-full"
                />
              </div>
              <Button variant="accent" onClick={setup.moveSelected} className="h-11 px-4">
                Move
              </Button>
              <Button variant="ghost" onClick={setup.clearSelection} className="h-11 px-3">
                Clear
              </Button>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="flex-1" />
            <Button variant="ghost" onClick={setup.close} className="max-md:h-[52px]">
              Later
            </Button>
            <Button
              variant="accent"
              onClick={setup.save}
              loading={setup.saving}
              className="max-md:h-[52px]">
              Save
            </Button>
          </div>
        </div>
      }>
      <section aria-labelledby="setup-paid-into">
        <h3 id="setup-paid-into" className={questionClasses}>
          Where do you get paid?
        </h3>
        <p className={hintClasses}>Your pay lands here on payday.</p>
        <div
          role="radiogroup"
          aria-labelledby="setup-paid-into"
          className="mt-3 flex flex-col gap-2">
          {setup.spending.map(account => (
            <label
              key={account.id}
              htmlFor={`setup-paid-into-${account.id}`}
              className={cn(
                'flex min-h-14 cursor-pointer items-center gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-2.5',
                setup.paidInto === account.id && 'border-accent bg-accent-soft'
              )}>
              <Radio
                id={`setup-paid-into-${account.id}`}
                name="setup-paid-into"
                checked={setup.paidInto === account.id}
                onChange={() => setup.setPaidInto(account.id)}
              />
              <span className="min-w-0 flex-1 text-sm font-bold [overflow-wrap:anywhere]">
                {account.name}
              </span>
              <span className="num text-sm font-extrabold">{formatBalance(account.balance)}</span>
            </label>
          ))}
        </div>
      </section>

      {setup.payments.length ? (
        <section aria-labelledby="setup-payments">
          <div className="flex items-baseline justify-between gap-3">
            <h3 id="setup-payments" className={questionClasses}>
              Which account does each payment come out of?
            </h3>
            <button
              type="button"
              onClick={setup.selectAll}
              className="shrink-0 cursor-pointer rounded-full px-2 py-2 text-[13px] font-bold text-accent-text hover:underline">
              Select all
            </button>
          </div>
          <p className={hintClasses}>Tick several to move them together.</p>
          <div className="mt-2">
            {setup.payments.map(payment => (
              <SetupPaymentRow
                key={payment.id}
                payment={payment}
                spending={setup.spending}
                from={setup.fromOf(payment)}
                onFrom={accountId => setup.setFromOf(payment, accountId)}
                selected={setup.selected.has(payment.id)}
                onToggle={() => setup.toggle(payment.id)}
                today={today}
              />
            ))}
          </div>
        </section>
      ) : null}
    </Modal>
  );
};
