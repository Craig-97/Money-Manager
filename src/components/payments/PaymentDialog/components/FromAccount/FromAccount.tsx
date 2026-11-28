import { Label, Select } from '../../../../form';
import { accountDescription } from '../../paymentAccounts';
import { PaymentForm } from '../../usePaymentForm';

/*
 * Which account a payment goes out of, or an income lands in, under More options. Only offered
 * once there's more than one account to spend from; until then everything uses the one pay lands
 * in. Each choice says what the account is, so there's no hint under it.
 */
export const FromAccount = ({ form }: { form: PaymentForm }) => {
  const { values, set, choices } = form;
  const { from } = choices;
  if (!from) return null;

  return (
    <div>
      <Label tone="muted" htmlFor="payment-account">
        {values.type === 'INCOME' ? 'Into' : 'From'}
      </Label>
      <Select
        id="payment-account"
        value={from.id}
        onValueChange={account => set('account', account)}
        options={choices.options.map(account => ({
          value: account.id,
          label: account.name,
          description: accountDescription(account)
        }))}
        className="bg-surface"
      />
    </div>
  );
};
