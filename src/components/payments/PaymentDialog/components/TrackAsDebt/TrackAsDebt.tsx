import { Switch } from '~/components/ui/Switch';
import { PaymentForm } from '../../usePaymentForm';
import { DebtFields } from '../DebtFields';

/*
 * The recurring form's card for a payment that's paying off a loan or card: a switch, and once
 * it's on, the debt's balance, rate and starting balance inside it. Opened from Debts it's always
 * a debt, so the card has no switch.
 */
export const TrackAsDebt = ({ form }: { form: PaymentForm }) => {
  const { values, set, asDebt } = form;

  return (
    <div
      role="group"
      aria-labelledby="payment-track-debt"
      className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span id="payment-track-debt" className="text-sm font-bold">
            {asDebt ? 'Debt details' : 'Track as a debt'}
          </span>
          <span
            id="payment-track-debt-hint"
            className="text-xs leading-[1.4] font-semibold text-muted">
            {asDebt
              ? 'Used for the payoff date on Debts'
              : 'For loans and cards. Shows it on Debts with a payoff date'}
          </span>
        </div>
        {asDebt ? null : (
          <Switch
            checked={values.tracked}
            onCheckedChange={on => set('tracked', on)}
            aria-labelledby="payment-track-debt"
            aria-describedby="payment-track-debt-hint"
          />
        )}
      </div>
      {values.tracked ? <DebtFields form={form} /> : null}
    </div>
  );
};
