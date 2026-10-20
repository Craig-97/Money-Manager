import { PaymentType } from '~/graphql/generated';
import { Account, isSpending } from '~/lib/accounts';

export type FormAccount = Pick<Account, 'id' | 'name' | 'counts' | 'kind' | 'paidInto'>;

interface AccountValues {
  type: PaymentType;
  tracked: boolean;
  // The account it goes out of, or an income lands in; '' for the one pay lands in
  account: string;
  // Another account it moves money into; '' for none
  paysInto: string;
}

/*
 * The accounts a payment form offers. An expense goes out of a spending account and an income can
 * land in any; choosing only appears once there's more than one to spend from. Money can move into
 * any other account, from an expense that isn't a debt.
 */
export const accountChoices = (values: AccountValues, accounts: readonly FormAccount[]) => {
  const paidInto = accounts.find(account => account.paidInto) ?? null;
  const several = accounts.filter(isSpending).length > 1;
  const options = values.type === 'EXPENSE' ? accounts.filter(isSpending) : accounts;
  const from = options.find(account => account.id === values.account) ?? paidInto;
  const targets = accounts.filter(account => account.id !== from?.id);
  const into =
    values.type === 'EXPENSE' && !values.tracked
      ? (targets.find(account => account.id === values.paysInto) ?? null)
      : null;
  return { paidInto, several, options, from, targets, into };
};
