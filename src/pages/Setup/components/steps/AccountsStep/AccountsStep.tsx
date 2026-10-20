import { Plus, RotateCcw } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { TextInput } from '~/components/form/TextInput';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { SetupState, useSetupDesktop } from '../../../hooks';
import { accountDetails, AccountsErrors, setupAccounts } from '../../../setupModel';
import {
  fieldLabelClasses,
  helpClasses,
  questionClasses,
  stepCardClasses,
  stepHeadingClasses
} from '../setupClasses';
import { SetupRow } from '../SetupRow';

const laterOnAccounts = 'You can add or change these later on Accounts.';

/*
 * Step 2: the account pay goes into, with what's in it today, then any others. Those are added in
 * the same dialog as on the Accounts page. Mobile folds the desktop's note into one help line.
 */
export const AccountsStep = ({ setup, errors }: { setup: SetupState; errors: AccountsErrors }) => {
  const isDesktop = useSetupDesktop();
  const { values } = setup;
  const others = setupAccounts(values).slice(1);

  const addButton = (
    <Button
      size={isDesktop ? 'lg' : 'xl'}
      onClick={() => setup.openAccount(null)}
      className={cn(
        'border-dashed border-border-strong font-bold',
        isDesktop ? 'self-start' : 'h-[52px] w-full'
      )}>
      <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
      Add an account
    </Button>
  );

  return (
    <section className={cn('flex flex-col', isDesktop ? 'gap-5' : 'gap-3.5')}>
      <div
        className={cn(
          stepCardClasses,
          'flex flex-col',
          isDesktop ? 'gap-5 p-6' : 'gap-4 px-4 py-[18px]'
        )}>
        <div className="flex flex-col gap-1">
          <h2 className={stepHeadingClasses}>Where do you get paid?</h2>
          <p className="text-[13px] leading-normal font-medium text-muted">
            The account your pay goes into. It always counts in free to spend.
            {isDesktop ? null : ' You can change where you get paid later on Accounts.'}
          </p>
        </div>
        <div>
          <label htmlFor="setup-paid-into-name" className={fieldLabelClasses}>
            Account name
          </label>
          <TextInput
            id="setup-paid-into-name"
            value={values.paidIntoName}
            onChange={event => setup.update('paidIntoName', event.target.value)}
            placeholder="e.g. Current account"
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
          <label
            htmlFor="setup-balance"
            className={isDesktop ? questionClasses : fieldLabelClasses}>
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
            {isDesktop
              ? "Include today's pay if it has already arrived."
              : "Use what your banking app shows today, including today's pay if it has arrived. We'll ask you to confirm it every payday."}
          </p>
        </div>
        {isDesktop ? (
          <div className="flex items-start gap-3 rounded-[20px] border border-border bg-surface-2 px-4 py-3.5">
            <RotateCcw size={18} className="mt-px shrink-0 text-accent-text" aria-hidden="true" />
            <p className="text-[13px] leading-normal text-muted">
              This is where you get paid for now. You can change where you get paid later on
              Accounts. Every payday we'll ask you to confirm its balance.
            </p>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          stepCardClasses,
          'flex flex-col',
          isDesktop ? 'gap-4 p-6' : 'overflow-hidden'
        )}>
        <div className={cn('flex flex-col gap-1', !isDesktop && 'px-4 pt-[18px] pb-3.5')}>
          <div className={cn('flex flex-wrap items-center', isDesktop ? 'gap-2.5' : 'gap-2')}>
            <h2 className={stepHeadingClasses}>Any other accounts?</h2>
            <span
              className={cn(
                'inline-flex h-[26px] items-center rounded-full px-2.5 text-xs font-bold whitespace-nowrap',
                isDesktop ? 'bg-surface-2 text-muted' : 'bg-accent-soft text-accent-text'
              )}>
              Optional
            </span>
          </div>
          <p className="text-[13px] leading-normal font-medium text-muted">
            {isDesktop
              ? 'A joint account, savings or anywhere else you keep money. Savings are kept out of free to spend unless you count them.'
              : 'A joint account or savings. Tap one to change it.'}
          </p>
        </div>
        {others.length ? (
          <div className={cn(isDesktop && '-mx-2.5 flex flex-col gap-0.5')}>
            {others.map(account => (
              <SetupRow
                key={account.id}
                name={account.name}
                details={accountDetails(account)}
                amount={formatBalance(account.balance)}
                tone="account"
                onOpen={() => setup.openAccount(account.id)}
              />
            ))}
          </div>
        ) : null}
        {isDesktop ? (
          <>
            {addButton}
            <p className="text-[13px] leading-normal font-medium text-muted">{laterOnAccounts}</p>
          </>
        ) : (
          <div className="border-t border-border px-4 pt-3.5 pb-4">{addButton}</div>
        )}
      </div>
      {isDesktop ? null : <p className={cn(helpClasses, 'mx-1 mt-0')}>{laterOnAccounts}</p>}
    </section>
  );
};
