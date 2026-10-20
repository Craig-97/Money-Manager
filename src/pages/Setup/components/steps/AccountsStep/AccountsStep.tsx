import { Plus, RotateCcw } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { SetupState } from '../../../hooks';
import { AccountsErrors, setupAccounts, SetupAccountView } from '../../../setupModel';
import { fieldLabelClasses, helpClasses, questionClasses, stepCardClasses } from '../setupClasses';
import { SetupRow } from '../SetupRow';

// "Spending · Shared household bills", "Savings · 4.5% · Counts in free to spend"
const detailsOf = (account: SetupAccountView) =>
  [
    account.kind === 'SPENDING' ? 'Spending' : 'Savings',
    account.kind === 'SAVINGS' && account.draft?.interestRate.trim()
      ? `${account.draft.interestRate.replace(/[%\s]/g, '')}%`
      : null,
    account.draft?.purpose.trim() || null,
    account.kind === 'SAVINGS' && account.counts ? 'Counts in free to spend' : null
  ]
    .filter(Boolean)
    .join(' · ');

/*
 * Step 2: the account pay goes into, with what's in it today, then any others. Those are added in
 * the same dialog as on the Accounts page.
 */
export const AccountsStep = ({ setup, errors }: { setup: SetupState; errors: AccountsErrors }) => {
  const { values } = setup;
  const others = setupAccounts(values).slice(1);

  return (
    <section className="flex flex-col gap-5">
      <div className={cn(stepCardClasses, 'flex flex-col gap-[18px] p-6')}>
        <h2 className={cn(questionClasses, 'mb-0')}>Where do you get paid?</h2>
        <div>
          <label htmlFor="setup-paid-into-name" className={fieldLabelClasses}>
            Account name
          </label>
          <TextInput
            id="setup-paid-into-name"
            value={values.paidIntoName}
            onChange={event => setup.update('paidIntoName', event.target.value)}
            maxLength={50}
            autoComplete="off"
            invalid={!!errors.paidIntoName}
            aria-describedby={errors.paidIntoName ? 'setup-paid-into-name-error' : undefined}
          />
          {errors.paidIntoName ? (
            <FieldError id="setup-paid-into-name-error">{errors.paidIntoName}</FieldError>
          ) : null}
        </div>
        <div>
          <label htmlFor="setup-balance" className={fieldLabelClasses}>
            Balance now
          </label>
          <AmountInput
            id="setup-balance"
            size="hero"
            value={values.balance}
            onChange={event => setup.update('balance', event.target.value)}
            invalid={!!errors.balance}
            aria-describedby={
              errors.balance ? 'setup-balance-error setup-balance-help' : 'setup-balance-help'
            }
          />
          {errors.balance ? (
            <FieldError id="setup-balance-error">{errors.balance}</FieldError>
          ) : null}
          <p id="setup-balance-help" className={helpClasses}>
            Include today's pay if it has already arrived.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-[20px] border border-border bg-surface-2 px-4 py-3.5">
          <RotateCcw size={18} className="mt-px shrink-0 text-accent-text" aria-hidden="true" />
          <p className="text-[13px] leading-normal text-muted">
            Every payday we'll ask you to confirm this number, so small differences don't build up
            over time.
          </p>
        </div>
      </div>

      <div className={cn(stepCardClasses, 'flex flex-col gap-3 p-6')}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={cn(questionClasses, 'mb-0')}>Any other accounts?</h2>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">
            Optional
          </span>
        </div>
        <p className="text-[13px] leading-normal text-muted">
          A joint account, savings or an ISA. You can add or change these later on Accounts.
        </p>
        {others.length ? (
          <div className="-mx-2.5">
            {others.map(account => (
              <SetupRow
                key={account.id}
                name={account.name}
                details={detailsOf(account)}
                amount={formatBalance(account.balance)}
                onOpen={() => setup.openAccount(account.id)}
              />
            ))}
          </div>
        ) : null}
        <Button onClick={() => setup.openAccount(null)} className="self-start px-4">
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          Add an account
        </Button>
      </div>
    </section>
  );
};
