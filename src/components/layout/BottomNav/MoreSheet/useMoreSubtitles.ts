import { PageName } from '~/app/routes/pageModules';
import { useBudget } from '~/hooks/useBudget';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { usePayCycle } from '~/hooks/usePayCycle';
import { useReminders } from '~/hooks/useReminders';
import { isStale, toAccounts } from '~/lib/accounts';
import { clearedText, debtTotals, isDebt, simulatePayoff } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { RecurringPayment, toPayments } from '~/lib/payments';

/*
 * The line under each of More's pages: how many accounts, what's left on the debts, how many notes,
 * who's signed in
 */
export const useMoreSubtitles = (): Partial<Record<PageName, string>> => {
  const { budget } = useBudget();
  const { user } = useCurrentUser();
  const { today } = usePayCycle(budget?.payday);

  const debts = budget
    ? toPayments(budget, today)
        .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
        .filter(isDebt)
    : [];
  const { months } = simulatePayoff(debts);
  const notes = budget?.notes?.length ?? 0;
  const accounts = toAccounts(budget?.accounts, today);
  const stale = accounts.find(account => isStale(account, today));
  const { unread } = useReminders();

  return {
    accounts: accounts.length
      ? `${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}` +
        (stale ? ` · ${stale.name} needs updating` : '')
      : 'Your current account and savings',
    debts: debts.length
      ? `${formatMoney(debtTotals(debts).left, { whole: true })} left` +
        (months === null ? '' : ` · debt-free ${clearedText(months, today)}`)
      : 'Loans and cards you’re paying off',
    notes: notes ? `${notes} ${notes === 1 ? 'note' : 'notes'}` : 'Nothing written yet',
    reminders: unread ? `${unread} new` : 'What’s due, renewing and coming up',
    profile: user ? `${user.firstName} ${user.surname}` : undefined
  };
};
