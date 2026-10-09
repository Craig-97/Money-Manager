import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Button } from '~/components/ui/Button';
import { Account } from '~/hooks/useAccount';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { useBalanceSettings } from '../../../hooks';
import { SECTION_ICONS } from '../sectionIcons';
import { helpClasses } from '../settingsClasses';
import { SettingsTile } from '../SettingsTile';

/* Bank balance and monthly income, and the figures they give */
export const BalancesSection = ({ account }: { account: Account }) => {
  const balances = useBalanceSettings(account);
  const { errors, summary } = balances;
  const figures = [
    { label: 'Free to spend', value: formatBalance(summary.freeToSpend) },
    { label: 'Payday balance', value: formatBalance(summary.onPayday) },
    { label: 'Discretionary', value: formatBalance(summary.discretionary), perMonth: true }
  ];

  return (
    <SettingsTile
      id="balances"
      icon={SECTION_ICONS.balances}
      title="Balances"
      description="Also editable from the dashboard."
      onSubmit={balances.save}
      footer={
        <>
          <span className={helpClasses}>Your forecast updates as soon as you save.</span>
          <Button
            type="submit"
            variant="accent"
            disabled={!balances.isDirty}
            loading={balances.saving}
            loadingText="Saving…"
            className="font-bold">
            Save changes
          </Button>
        </>
      }>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="balances-bank">Bank balance</Label>
          <AmountInput
            id="balances-bank"
            value={balances.balance}
            onChange={event => balances.setBalance(event.target.value)}
            invalid={!!errors.balance}
            aria-describedby={errors.balance ? 'balances-bank-error' : 'balances-bank-help'}
          />
          {errors.balance ? (
            <FieldError id="balances-bank-error">{errors.balance}</FieldError>
          ) : (
            <p id="balances-bank-help" className={cn('mt-2', helpClasses)}>
              What your bank says right now
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="balances-income">Monthly income</Label>
          <AmountInput
            id="balances-income"
            value={balances.income}
            onChange={event => balances.setIncome(event.target.value)}
            invalid={!!errors.income}
            aria-describedby={errors.income ? 'balances-income-error' : 'balances-income-help'}
          />
          {errors.income ? (
            <FieldError id="balances-income-error">{errors.income}</FieldError>
          ) : (
            <p id="balances-income-help" className={cn('mt-2', helpClasses)}>
              After tax, paid on payday
            </p>
          )}
        </div>
      </div>
      <dl
        aria-live="polite"
        className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        {figures.map(figure => (
          <div key={figure.label} className="flex flex-col gap-1 bg-surface-2 px-4 py-3.5">
            <dt className="text-xs font-semibold text-muted">{figure.label}</dt>
            <dd className="num text-base font-extrabold">
              {figure.value}
              {figure.perMonth ? (
                <span className="text-xs font-semibold text-muted">/mo</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </SettingsTile>
  );
};
