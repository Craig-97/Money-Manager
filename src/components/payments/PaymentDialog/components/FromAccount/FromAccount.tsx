import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { PaymentForm } from '../../usePaymentForm';

/*
 * Which account a payment goes out of, or an income lands in. Only offered once there's more than
 * one account to spend from; until then everything uses the one pay lands in.
 */
export const FromAccount = ({ form }: { form: PaymentForm }) => {
  const { values, set, choices } = form;
  const income = values.type === 'INCOME';
  const { from } = choices;
  if (!from) return null;

  return (
    <div>
      <Label tone="muted" htmlFor="payment-account">
        {income ? 'Into' : 'From'}
      </Label>
      <Select
        id="payment-account"
        value={from.id}
        onValueChange={account => set('account', account)}
        options={choices.options.map(account => ({ value: account.id, label: account.name }))}
        aria-describedby="payment-account-hint"
      />
      <p id="payment-account-hint" className="mt-2 ml-1 text-xs font-semibold text-muted">
        {income
          ? `Goes into ${from.name} when it’s marked paid`
          : `Comes off ${from.name} when it’s marked paid`}
      </p>
    </div>
  );
};
