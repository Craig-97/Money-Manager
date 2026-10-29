import { ChevronRight } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { Button } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { Budget } from '~/hooks/useBudget';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { useBalanceSettings } from '../../../hooks';
import { SECTION_ICONS } from '../sectionIcons';
import { helpClasses } from '../settingsClasses';
import { SettingsTile } from '../SettingsTile';

/* The bank balance, made of the accounts, and monthly income, and the figures they give */
export const BalancesSection = ({ budget }: { budget: Budget }) => {
  const balances = useBalanceSettings(budget);
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
      description="Your accounts make up the bank balance on your dashboard."
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
          <p id="balances-bank" className="mb-2 block text-[13px] font-bold text-text">
            Bank balance
          </p>
          <PageLink
            page="accounts"
            to={ROUTES.accounts}
            aria-describedby="balances-bank-help"
            className="flex min-h-[60px] items-center gap-3 rounded-[18px] border border-border bg-surface-2 py-2.5 pr-3 pl-[18px] text-text no-underline hover:bg-hover">
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <span className="num text-lg font-extrabold">
                {formatBalance(balances.bankBalance)}
              </span>
              <span className="text-xs font-semibold text-muted">
                {balances.accountsText}
                {balances.staleText ? (
                  <>
                    {' · '}
                    <span className="text-warn">{balances.staleText}</span>
                  </>
                ) : null}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-bold whitespace-nowrap text-accent-text">
              Manage accounts
              <ChevronRight size={16} aria-hidden="true" />
            </span>
          </PageLink>
          <p id="balances-bank-help" className={cn('mt-2', helpClasses)}>
            Change balances on the Accounts page
          </p>
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
