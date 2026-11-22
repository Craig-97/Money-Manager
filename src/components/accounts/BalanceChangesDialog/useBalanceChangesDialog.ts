import { useShallow } from 'zustand/react/shallow';
import { AccountHistoryDocument } from '~/graphql/generated';
import { useBackToAccount } from '~/hooks/useBackToAccount';
import { useHistoryByYear } from '~/hooks/useHistoryByYear';
import { Account, balanceChanges, interestInYear } from '~/lib/accounts';
import { formatMoney } from '~/lib/format';
import { yearPaging } from '~/lib/paging';
import { byMonth } from '~/lib/payments';
import { useAccountQuickStore } from '~/state/accountQuick';

/*
 * The account See balance changes opened, a year of what moved its balance, and the interest that
 * year added. Back goes to the account's view when it came from there.
 */
export const useBalanceChangesDialog = ({
  accounts,
  today
}: {
  accounts: readonly Account[];
  today: Date;
}) => {
  const { open, accountId, close } = useAccountQuickStore(
    useShallow(s => ({ open: s.open === 'history', accountId: s.accountId, close: s.close }))
  );
  // Kept while closing, so it animates away showing what it showed
  const account = accounts.find(item => item.id === accountId);
  const back = useBackToAccount(account?.id);
  const history = useHistoryByYear(AccountHistoryDocument, {
    id: account?.id,
    today,
    select: data => data.account
  });
  if (!account) return null;

  // The newest year leads with the next interest
  const changes = history.records
    ? balanceChanges(account, { records: history.records, next: history.year === history.years[0] })
    : [];
  const older = history.older.flatMap(({ records }) =>
    balanceChanges(account, { records, next: false })
  );

  return {
    open,
    account,
    close,
    back,
    history,
    // Desktop: the year showing. A phone: it and the older years added below it.
    months: byMonth(changes),
    allMonths: byMonth([...changes, ...older]),
    empty: !!history.records && !changes.length,
    paging: yearPaging(history.years, history.year),
    // "£4,200.00 now · £118.10 interest in 2026"
    summary: {
      amount: formatMoney(account.balance),
      rest: ['now', interestInYear(changes, history.year)].filter(Boolean).join(' · ')
    }
  };
};

export type BalanceChangesDialogModel = NonNullable<ReturnType<typeof useBalanceChangesDialog>>;
