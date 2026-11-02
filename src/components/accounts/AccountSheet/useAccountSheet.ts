import { useShallow } from 'zustand/react/shallow';
import { useAccountActions } from '~/hooks/useAccountActions';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import {
  hasMatured,
  interestPerPayment,
  interestScheduleText,
  isInterestDue,
  isSpending,
  toAccounts
} from '~/lib/accounts';
import { formatMoney } from '~/lib/format';
import { useAccountDialogStore } from '~/state/accountDialog';
import { useAccountQuickStore } from '~/state/accountQuick';
import { useAccountViewStore } from '~/state/accountView';
import { usePaymentDialogStore } from '~/state/paymentDialog';

/*
 * The account a name opened, and where its tiles and rows go. Each closes the view and opens its
 * small dialog, which has a back arrow to it; Edit account opens the full form.
 */
export const useAccountSheet = () => {
  const { budget } = useBudget();
  const { today } = usePayCycle(budget?.payday);
  const { accountId, open, close } = useAccountViewStore(
    useShallow(s => ({ accountId: s.accountId, open: s.open, close: s.close }))
  );
  const openQuick = useAccountQuickStore(s => s.openFor);
  const openEdit = useAccountDialogStore(s => s.openEdit);
  const openMoveInto = usePaymentDialogStore(s => s.openMoveInto);
  const { setCounts, saveInterest } = useAccountActions(budget);

  const accounts = toAccounts(budget?.accounts, today);
  const account = accounts.find(item => item.id === accountId);
  if (!account) return { open: false, account: null } as const;

  const then = (run: () => void) => () => {
    close();
    run();
  };
  const options = { accountId: account.id, fromView: true };
  const { interest } = account;
  const savings = !isSpending(account);

  return {
    open,
    account,
    today,
    close,
    // Where pay lands always counts, so its switch is locked on
    countsLocked: account.paidInto,
    setCounts: (counts: boolean) => setCounts(account, counts),
    updateBalance: then(() => openQuick('balance', options)),
    // A payment of interest waiting to be checked comes first, with its estimate
    checkInterest:
      interest?.frequency && isInterestDue(interest, today)
        ? {
            detail: `About ${formatMoney(interestPerPayment(account.balance, { rate: interest.rate, frequency: interest.frequency }))}`,
            open: then(() => openQuick('check', options))
          }
        : null,
    // Savings only: its rate and when it's paid
    interest: savings
      ? {
          detail: interest ? interestScheduleText(interest, today) : 'Not set up',
          open: then(() => openQuick('interest', options))
        }
      : null,
    // A fixed term that has paid out: a new term, or done
    matured: hasMatured(interest)
      ? {
          newTerm: then(() => openQuick('interest', options)),
          stop: () => void saveInterest(account, { rate: interest!.rate, frequency: null })
        }
      : null,
    // Another spending account can take over where pay lands
    canBePaidInto: isSpending(account) && !account.paidInto,
    makePaidInto: then(() => openQuick('paidInto', options)),
    // A standing order into it needs another account to come from
    canMoveInto: !account.paidInto && accounts.length > 1,
    moveInto: then(() => openMoveInto(account.id)),
    edit: then(() => openEdit(account.id))
  } as const;
};
