import { formatMoney, parseMoney } from '~/lib/format';
import { Label, Select } from '../../../../form';
import { targetDescription } from '../../paymentAccounts';
import { PaymentForm } from '../../usePaymentForm';

/*
 * The account money moves into, and what that does. One that counts in free to spend only moves
 * money between the accounts making up the bank balance, so it's left out of the monthly totals.
 */
export const MoveInto = ({ form }: { form: PaymentForm }) => {
  const { set, choices } = form;
  const { into, targets } = choices;
  if (!into) return null;
  const amount = parseMoney(form.values.amount);

  return (
    <div>
      <Label tone="muted" htmlFor="payment-pays-into-account">
        Into
      </Label>
      <Select
        id="payment-pays-into-account"
        value={into.id}
        onValueChange={id => set('paysInto', id)}
        options={targets.map(account => ({
          value: account.id,
          label: account.name,
          description: targetDescription(account)
        }))}
      />
      <p className="mt-2 ml-1 text-xs leading-[1.45] font-semibold text-muted">
        {into.counts
          ? `${into.name} counts in free to spend, so this only moves money between your accounts. It’s left out of your monthly totals.`
          : `Comes off free to spend like any payment. When it’s marked paid, ${amount ? `${formatMoney(amount)} is` : 'it’s'} added to ${into.name}.`}
      </p>
    </div>
  );
};
