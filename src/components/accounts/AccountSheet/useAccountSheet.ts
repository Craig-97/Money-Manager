import { useShallow } from 'zustand/react/shallow';
import { useAccountActions } from '~/hooks/useAccountActions';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { isSpending, toAccounts } from '~/lib/accounts';
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
  const { setCounts } = useAccountActions(budget);

  const accounts = toAccounts(budget?.accounts, today);
  const account = accounts.find(item => item.id === accountId);
  if (!account) return { open: false, account: null } as const;

  const then = (run: () => void) => () => {
    close();
    run();
  };
  const options = { accountId: account.id, fromView: true };

  return {
    open,
    account,
    today,
    close,
    // Where pay lands always counts, so its switch is locked on
    countsLocked: account.paidInto,
    setCounts: (counts: boolean) => setCounts(account, counts),
    updateBalance: then(() => openQuick('balance', options)),
    // Another spending account can take over where pay lands
    canBePaidInto: isSpending(account) && !account.paidInto,
    makePaidInto: then(() => openQuick('paidInto', options)),
    // A standing order into it needs another account to come from
    canMoveInto: !account.paidInto && accounts.length > 1,
    moveInto: then(() => openMoveInto(account.id)),
    edit: then(() => openEdit(account.id))
  } as const;
};
