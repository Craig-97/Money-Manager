import { Label } from '~/components/form/Label';
import { Select } from '~/components/form/Select';
import { Switch } from '~/components/ui/Switch';
import { formatMoney, parseMoney } from '~/lib/format';
import { PaymentForm } from '../../usePaymentForm';

/*
 * The recurring form's switch for a standing order into one of the budget's savings accounts, and
 * which one. What it says changes with the account: one that counts in free to spend only moves
 * money between the accounts making up the bank balance.
 */
export const PaysInto = ({ form }: { form: PaymentForm }) => {
  const { values, set, savings } = form;
  const into = savings.find(account => account.id === values.paysInto);
  const amount = parseMoney(values.amount);

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span id="payment-pays-into" className="text-sm font-bold">
            Pays into savings
          </span>
          <span id="payment-pays-into-hint" className="text-xs font-semibold text-muted">
            For standing orders to your own accounts. Added there when it’s paid
          </span>
        </div>
        <Switch
          checked={!!into}
          onCheckedChange={on => set('paysInto', on ? savings[0].id : '')}
          aria-labelledby="payment-pays-into"
          aria-describedby="payment-pays-into-hint"
        />
      </div>
      {into ? (
        <>
          <div>
            <Label tone="muted" htmlFor="payment-pays-into-account">
              Into
            </Label>
            <Select
              id="payment-pays-into-account"
              value={into.id}
              onValueChange={id => set('paysInto', id)}
              options={savings.map(account => ({ value: account.id, label: account.name }))}
              className="bg-surface"
            />
          </div>
          <p className="text-xs leading-[1.45] font-semibold text-muted">
            {into.counts
              ? `${into.name} counts in free to spend, so this only moves money between your accounts. It won’t come off free to spend.`
              : `Comes off free to spend like any payment. When it’s marked paid, ${amount ? `${formatMoney(amount)} is` : 'it’s'} added to ${into.name}.`}
          </p>
        </>
      ) : null}
    </div>
  );
};
