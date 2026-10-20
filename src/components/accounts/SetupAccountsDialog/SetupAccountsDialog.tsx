import { ArrowRight, X } from 'lucide-react';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { Radio } from '~/components/form/Radio';
import { Select } from '~/components/form/Select';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { Modal } from '~/components/ui/Modal';
import { MEDIA } from '~/constants';
import { useBudget } from '~/hooks/useBudget';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { usePayCycle } from '~/hooks/usePayCycle';
import { toAccounts } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { formatShortDate, RecurringPayment, toPayments } from '~/lib/payments';
import { SetupPaymentRow } from './components';
import { useSetupAccounts } from './useSetupAccounts';

const questionClasses = 'text-base font-extrabold tracking-[-0.01em]';
const hintClasses = 'mt-1 text-xs leading-[1.4] font-semibold text-muted md:text-[13px]';

/*
 * "Set up your accounts", once there's more than one account to spend from: where pay lands, then
 * which account each recurring expense goes out of. A dialog on desktop, a sheet on mobile. Ticking
 * payments shows a bar to move them together: above the list on desktop, over the buttons on a
 * phone. With three or more accounts to spend from, the bar also picks which one they move to.
 */
export const SetupAccountsDialog = () => {
  const { budget } = useBudget();
  const { today, cycle } = usePayCycle(budget?.payday);
  const isDesktop = useMediaQuery(MEDIA.desktop);
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
  const paidName = setup.spending.find(account => account.id === setup.paidInto)?.name ?? '';
  const paidNowName =
    setup.spending.find(account => account.id === setup.paidIntoNow)?.name ?? 'Your account';
  const moving = !!setup.paidInto && setup.paidInto !== setup.paidIntoNow;
  // A choice of where ticked payments go, once there's more than one place they could
  const pickTarget = setup.spending.length > 2;
  const moveLabel = `Move ${count} to ${setup.moveTo?.name ?? ''}`;
  const someSelected = count > 0 && !setup.allSelected;

  const targetPicker = pickTarget ? (
    <Select
      variant="pill"
      value={setup.moveTo?.id}
      onValueChange={setup.setTarget}
      options={setup.spending.map(account => ({ value: account.id, label: account.name }))}
      aria-label="Account to move them to"
      className={isDesktop ? 'w-[170px]' : 'w-full'}
    />
  ) : null;

  const selectAll = (id: string) => (
    <CheckboxHitArea htmlFor={id}>
      <Checkbox
        id={id}
        checked={setup.allSelected}
        indeterminate={someSelected}
        onChange={setup.toggleAll}
        aria-label="Select all payments"
      />
    </CheckboxHitArea>
  );

  // Desktop: sticky at the top of the list while payments are ticked
  const bulkBar = (
    <div className="sticky -top-2.5 z-[3] mt-1 flex min-h-14 flex-wrap items-center gap-2.5 rounded-2xl bg-accent-soft py-1.5 pr-2">
      {selectAll('setup-all-bulk')}
      <span className="mr-1 num text-sm font-extrabold text-accent-text">{count} selected</span>
      <span aria-hidden="true" className="h-6 w-px bg-border-strong" />
      {targetPicker}
      <Button variant="solid" onClick={setup.moveSelected} className="text-[13px]">
        <ArrowRight size={16} aria-hidden="true" />
        {pickTarget ? `Move ${count}` : moveLabel}
      </Button>
      <Button variant="ghost" onClick={setup.clearSelection} className="ml-auto text-[13px]">
        Clear
      </Button>
    </div>
  );

  // Mobile: over Later and Save while payments are ticked
  const mobileBulkBar = (
    <div className="flex flex-col gap-1.5 rounded-[26px] bg-accent-soft p-1">
      <div className="flex items-center gap-1.5">
        <IconButton
          aria-label="Clear selection"
          onClick={setup.clearSelection}
          className="text-accent-text">
          <X size={18} aria-hidden="true" />
        </IconButton>
        <span className="min-w-0 flex-1 num text-[13px] font-extrabold text-accent-text">
          {count} selected
        </span>
        {pickTarget ? null : (
          <Button variant="solid" onClick={setup.moveSelected} className="px-4 text-[13px]">
            {moveLabel}
          </Button>
        )}
      </div>
      {pickTarget ? (
        <div className="flex items-center gap-1.5 px-1 pb-1">
          <div className="min-w-0 flex-1">{targetPicker}</div>
          <Button variant="solid" onClick={setup.moveSelected} className="px-4 text-[13px]">
            Move {count}
          </Button>
        </div>
      ) : null}
    </div>
  );

  return (
    <Modal
      open={setup.open}
      onOpenChange={next => (next ? undefined : setup.close())}
      title="Set up your accounts"
      subtitle={
        <p className="mt-1 text-[13px] leading-[1.45] font-medium text-muted md:mt-1.5 md:text-sm">
          You have {setup.spending.length} spending accounts now. Say where your pay goes and where
          each payment comes from{isDesktop ? ', so each balance stays right.' : '.'}
        </p>
      }
      extraWide
      footer={
        isDesktop ? (
          <>
            {setup.payments.length ? (
              <span className="num text-[13px] font-semibold text-muted">{setup.summary}</span>
            ) : null}
            <span className="flex-1" />
            <Button variant="ghost" onClick={setup.close}>
              Later
            </Button>
            <Button variant="accent" onClick={setup.save} loading={setup.saving}>
              Save
            </Button>
          </>
        ) : (
          <div className="flex w-full flex-col gap-2.5">
            {count ? mobileBulkBar : null}
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="ghost" onClick={setup.close} className="h-[52px]">
                Later
              </Button>
              <Button
                variant="accent"
                onClick={setup.save}
                loading={setup.saving}
                className="h-[52px]">
                Save
              </Button>
            </div>
          </div>
        )
      }>
      <div className="flex flex-col gap-6 md:gap-7">
        <section aria-labelledby="setup-paid-into" className="flex flex-col gap-2.5 md:gap-3">
          <div className="px-1 md:px-0">
            <h3 id="setup-paid-into" className={questionClasses}>
              Where do you get paid?
            </h3>
            <p className={hintClasses}>
              Your pay goes in here, and it always counts in free to spend.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="setup-paid-into"
            className="grid gap-2 md:grid-cols-2 md:gap-2.5">
            {setup.spending.map(account => {
              const on = setup.paidInto === account.id;
              return (
                <label
                  key={account.id}
                  htmlFor={`setup-paid-into-${account.id}`}
                  className={cn(
                    'flex min-h-[60px] cursor-pointer items-center gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3 transition-colors hover:border-border-strong md:min-h-[68px]',
                    on && 'border-accent bg-accent-soft hover:border-accent'
                  )}>
                  <Radio
                    id={`setup-paid-into-${account.id}`}
                    name="setup-paid-into"
                    checked={on}
                    onChange={() => setup.setPaidInto(account.id)}
                  />
                  <span className="flex min-w-0 flex-1 items-center gap-3 md:flex-col md:items-start md:gap-0.5">
                    <span className="min-w-0 flex-1 text-[15px] font-bold [overflow-wrap:anywhere] md:flex-none">
                      {account.name}
                    </span>
                    <span className="num text-[13px] font-bold whitespace-nowrap text-muted md:font-semibold">
                      {formatBalance(account.balance)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {moving ? (
            <p
              aria-live="polite"
              className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface-2 px-3.5 py-3 text-[13px] leading-[1.45] font-semibold text-muted">
              <ArrowRight
                size={16}
                className="mt-px shrink-0 text-accent-text"
                aria-hidden="true"
              />
              <span>
                Your pay goes into {paidName} from {formatShortDate(cycle.end, today)}.{' '}
                {paidNowName} stops being where you get paid.
              </span>
            </p>
          ) : null}
        </section>

        {setup.payments.length ? (
          <section aria-labelledby="setup-payments" className="flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-start gap-2 pl-1 md:pl-0">
              <div className="min-w-0 flex-1">
                <h3 id="setup-payments" className={cn(questionClasses, 'leading-[1.3]')}>
                  Which account does each payment come from?
                </h3>
                <p className={hintClasses}>
                  {setup.allOnPaidInto ? `They all start on ${paidName}. ` : ''}Tick a few to move
                  them together.
                </p>
              </div>
              {isDesktop ? null : (
                <Button
                  variant="ghost"
                  onClick={setup.toggleAll}
                  className="shrink-0 px-3 text-[13px] text-accent-text hover:text-accent-text">
                  {setup.allSelected ? 'Clear all' : 'Select all'}
                </Button>
              )}
            </div>

            {isDesktop ? (
              count ? (
                bulkBar
              ) : (
                <div className="mt-1 flex min-h-[52px] items-center gap-2.5 pr-2 text-xs font-bold tracking-[0.04em] text-muted uppercase">
                  {selectAll('setup-all')}
                  <span className="flex-1 pl-12">Payment</span>
                  <span className="w-[100px] text-right">Amount</span>
                  <span className="w-[190px] pl-4">From</span>
                </div>
              )
            ) : null}

            <div
              role="list"
              aria-label="Recurring payments"
              className="flex flex-col gap-0.5 border-t border-border pt-1.5">
              {setup.payments.map(payment => (
                <SetupPaymentRow
                  key={payment.id}
                  payment={payment}
                  spending={setup.spending}
                  from={setup.fromOf(payment)}
                  paidInto={setup.paidInto}
                  onFrom={accountId => setup.setFromOf(payment, accountId)}
                  selected={setup.selected.has(payment.id)}
                  onToggle={() => setup.toggle(payment.id)}
                  today={today}
                  compact={!isDesktop}
                />
              ))}
            </div>
            <p className="mx-1 mt-1.5 text-xs leading-[1.4] font-semibold text-muted md:mx-0">
              Income goes into {paidName}. You can change any payment’s account later, on Recurring.
            </p>
          </section>
        ) : null}
      </div>
    </Modal>
  );
};
