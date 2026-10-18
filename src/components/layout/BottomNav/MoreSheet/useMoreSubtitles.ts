import { PageName } from '~/app/routes/pageModules';
import { useAccount } from '~/hooks/useAccount';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { usePayCycle } from '~/hooks/usePayCycle';
import { useReminders } from '~/hooks/useReminders';
import { clearedText, debtTotals, isDebt, simulatePayoff } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { RecurringPayment, toPayments } from '~/lib/payments';

/* The line under each of More's pages: what's left on the debts, how many notes, who's signed in */
export const useMoreSubtitles = (): Partial<Record<PageName, string>> => {
  const { account } = useAccount();
  const { user } = useCurrentUser();
  const { today } = usePayCycle(account?.payday);

  const debts = account
    ? toPayments(account, today)
        .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
        .filter(isDebt)
    : [];
  const { months } = simulatePayoff(debts);
  const notes = account?.notes?.length ?? 0;
  const { unread } = useReminders();

  return {
    debts: debts.length
      ? `${formatMoney(debtTotals(debts).left, { whole: true })} left` +
        (months === null ? '' : ` · debt-free ${clearedText(months, today)}`)
      : 'Loans and cards you’re paying off',
    notes: notes ? `${notes} ${notes === 1 ? 'note' : 'notes'}` : 'Nothing written yet',
    reminders: unread ? `${unread} new` : 'What’s due, renewing and coming up',
    profile: user ? `${user.firstName} ${user.surname}` : undefined
  };
};
