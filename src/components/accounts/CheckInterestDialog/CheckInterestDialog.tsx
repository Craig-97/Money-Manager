import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Button } from '~/components/ui/Button';
import { ChangePreview } from '~/components/ui/ChangePreview';
import { Modal } from '~/components/ui/Modal';
import { useBackToAccount } from '~/hooks/useBackToAccount';
import { useReminderActions } from '~/hooks/useReminderActions';
import { useReminders } from '~/hooks/useReminders';
import { Account, interestPerPayment, previousInterestDate } from '~/lib/accounts';
import { formatBalance, formatMoney, formatMoneyInput, parseMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { interestReminderKey } from '~/lib/reminders';
import { useAccountQuickStore } from '~/state/accountQuick';
import { AccountSummary } from '../AccountSummary';

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

interface CheckInterestDialogProps {
  accounts: readonly Account[];
  today: Date;
  onConfirm: (account: Account, amount: number | null) => Promise<boolean>;
}

/*
 * Check interest: a payment of a savings account's interest, with the estimate filled in to check
 * against the bank. Add puts what was paid on the balance, dated today; Later asks again tomorrow,
 * as it's still coming; Skip is for a time none was paid.
 */
export const CheckInterestDialog = ({ accounts, today, onConfirm }: CheckInterestDialogProps) => {
  const { open, accountId, opened, close } = useAccountQuickStore(
    useShallow(s => ({
      open: s.open === 'check',
      accountId: s.accountId,
      opened: s.opened,
      close: s.close
    }))
  );
  const reminders = useReminders();
  const reminderActions = useReminderActions({
    budgetId: reminders.budgetId ?? '',
    states: reminders.states,
    today: reminders.today
  });
  const account = accounts.find(item => item.id === accountId);
  const back = useBackToAccount(account?.id);
  const interest = account?.interest;
  const estimate =
    account && interest?.frequency
      ? interestPerPayment(account.balance, { rate: interest.rate, frequency: interest.frequency })
      : 0;
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  // A new opening starts from the estimate (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setDraft(formatMoneyInput(estimate));
  }

  if (!account || !interest?.frequency || !interest.nextDate) return null;
  const { nextDate } = interest;
  const amount = parseMoney(draft);
  const valid = amount !== null && amount > 0;
  const since = previousInterestDate(interest);
  const counted = roundPence(
    accounts.filter(item => item.counts).reduce((sum, item) => sum + item.balance, 0)
  );

  const finish = async (paid: number | null) => {
    setSaving(true);
    const saved = await onConfirm(account, paid);
    setSaving(false);
    if (saved) close();
  };
  const later = () => {
    const key = interestReminderKey(account);
    if (key) void reminderActions.later({ key, kind: 'interest' });
    close();
  };

  return (
    <Modal
      open={open}
      onOpenChange={next => (next ? undefined : close())}
      title="Check interest"
      onBack={back}
      backLabel={`Back to ${account.name}`}
      initialFocusId="account-interest-paid-in"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => void finish(null)}
            disabled={saving}
            className="max-md:h-[52px] max-md:flex-1">
            Skip {nextDate.toLocaleDateString('en-GB', { month: 'short' })}
          </Button>
          <span className="flex-1 max-md:hidden" />
          <Button variant="ghost" onClick={later} className="max-md:h-[52px] max-md:flex-1">
            Later
          </Button>
          <Button
            variant="accent"
            onClick={() => void (valid && finish(amount))}
            disabled={!valid}
            loading={saving}
            className="max-md:h-[52px] max-md:flex-1">
            Add {valid ? formatMoney(amount) : ''}
          </Button>
        </>
      }>
      <AccountSummary account={account} today={today} named />
      <div>
        <Label tone="muted" htmlFor="account-interest-paid-in">
          Interest paid in
        </Label>
        <AmountInput
          id="account-interest-paid-in"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && valid) void finish(amount);
          }}
          placeholder="0.00"
          invalid={!!draft && amount === null}
          aria-describedby={
            draft && amount === null
              ? 'account-interest-paid-in-error'
              : 'account-interest-paid-in-hint'
          }
        />
        {draft && amount === null ? (
          <FieldError id="account-interest-paid-in-error">Enter the amount, like 14.09</FieldError>
        ) : (
          <p
            id="account-interest-paid-in-hint"
            className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">
            Our estimate is {formatMoney(estimate)}, worked out each day on{' '}
            {formatBalance(account.balance)} at {interest.rate}%
            {since ? ` since ${formatShortDate(since, today)}` : ''}. Check your banking app and
            type what it says.
          </p>
        )}
      </div>
      {valid ? (
        <ChangePreview
          label={account.name}
          before={formatBalance(account.balance)}
          after={formatBalance(roundPence(account.balance + amount))}
        />
      ) : null}
      {valid && account.counts ? (
        <ChangePreview
          label="Bank balance on your dashboard"
          before={formatBalance(counted)}
          after={formatBalance(roundPence(counted + amount))}
        />
      ) : null}
      <p className="ml-1 text-xs leading-[1.4] font-semibold text-muted">
        {account.counts
          ? 'It counts in free to spend, so free to spend goes up too.'
          : `${account.name} is kept out of free to spend, so that doesn’t change.`}{' '}
        Adding it marks the balance as updated today. Interest isn’t income, so it stays out of your
        monthly totals.
      </p>
    </Modal>
  );
};
