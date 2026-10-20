import { useState } from 'react';
import { Budget } from '~/hooks/useBudget';

export type AccountsView = 'balances' | 'before';

/*
 * Balances or Before payday. With one account to spend from there's nothing to split by account,
 * so only Balances shows. The header holds the switch on desktop, so the page owns it.
 */
export const useAccountsView = (budget: Budget | null | undefined) => {
  const [chosen, setView] = useState<AccountsView>('balances');
  const several =
    (budget?.accounts ?? []).filter(account => account.kind === 'SPENDING').length > 1;
  return { view: several ? chosen : 'balances', setView, several } as const;
};

export type AccountsViewState = ReturnType<typeof useAccountsView>;

export const ACCOUNTS_VIEWS: { value: AccountsView; label: string }[] = [
  { value: 'balances', label: 'Balances' },
  { value: 'before', label: 'Before payday' }
];
