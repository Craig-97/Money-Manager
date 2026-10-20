import { ReactNode } from 'react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { TextInput } from '~/components/form/TextInput';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { Switch } from '~/components/ui/Switch';
import { AccountKind } from '~/graphql/generated';
import { AccountDraft, AccountDraftErrors } from '../accountDraft';

export const helpClasses = 'mt-2 ml-1 text-xs font-semibold text-muted';
export const panelClasses =
  'flex items-center gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3.5';

const KINDS: { value: AccountKind; label: string }[] = [
  { value: 'SPENDING', label: 'Spending' },
  { value: 'SAVINGS', label: 'Savings' }
];

const KIND_HINTS: Record<AccountKind, string> = {
  SPENDING: 'Money you spend from, like a current or joint account. It always counts.',
  SAVINGS: 'Money put aside. Kept out of free to spend unless you count it.'
};

interface AccountFieldsProps {
  draft: AccountDraft;
  set: (fields: Partial<AccountDraft>) => void;
  errors: AccountDraftErrors;
  // After "Check your banking app…", e.g. how old the balance is
  balanceHint?: string;
  canChangeKind: boolean;
  // Shown after the type, e.g. the "Where you get paid" switch
  afterKind?: ReactNode;
  // Shown before the count switch for savings, e.g. the payments that pay in
  beforeCounts?: ReactNode;
}

/*
 * An account's fields, the same wherever one is added or changed: the balance first, its name and
 * type, then what it's for, and for savings a rate and whether it counts in free to spend.
 */
export const AccountFields = ({
  draft,
  set,
  errors,
  balanceHint,
  canChangeKind,
  afterKind,
  beforeCounts
}: AccountFieldsProps) => {
  const purpose = (placeholder: string) => (
    <div>
      <Label tone="muted" htmlFor="account-purpose">
        What it’s for (optional)
      </Label>
      <TextInput
        id="account-purpose"
        value={draft.purpose}
        onChange={event => set({ purpose: event.target.value })}
        placeholder={placeholder}
        maxLength={60}
        autoComplete="off"
        invalid={!!errors.purpose}
        aria-describedby={errors.purpose ? 'account-purpose-error' : undefined}
      />
      {errors.purpose ? <FieldError id="account-purpose-error">{errors.purpose}</FieldError> : null}
    </div>
  );

  return (
    <>
      <div>
        <Label tone="muted" htmlFor="account-balance">
          Balance now
        </Label>
        <AmountInput
          id="account-balance"
          size="hero"
          value={draft.balance}
          onChange={event => set({ balance: event.target.value })}
          placeholder="0.00"
          invalid={!!errors.balance}
          aria-describedby={errors.balance ? 'account-balance-error' : 'account-balance-help'}
        />
        {errors.balance ? (
          <FieldError id="account-balance-error">{errors.balance}</FieldError>
        ) : (
          <p id="account-balance-help" className={helpClasses}>
            Check your banking app and type what it says.
            {balanceHint ? ` ${balanceHint}` : ''}
          </p>
        )}
      </div>

      <div>
        <Label tone="muted" htmlFor="account-name">
          Name
        </Label>
        <TextInput
          id="account-name"
          value={draft.name}
          onChange={event => set({ name: event.target.value })}
          placeholder="e.g. Easy access"
          maxLength={50}
          autoComplete="off"
          invalid={!!errors.name}
          aria-describedby={errors.name ? 'account-name-error' : undefined}
        />
        {errors.name ? <FieldError id="account-name-error">{errors.name}</FieldError> : null}
      </div>

      {canChangeKind ? (
        <div>
          <p id="account-kind" className="mb-2 text-[13px] font-bold text-muted">
            Type
          </p>
          <SegmentedControl
            aria-labelledby="account-kind"
            value={draft.kind}
            onValueChange={kind => set({ kind })}
            options={KINDS}
            size="lg"
            fullWidth
          />
          <p className={helpClasses}>{KIND_HINTS[draft.kind]}</p>
        </div>
      ) : null}

      {afterKind}

      {draft.kind === 'SPENDING' ? (
        purpose('e.g. Shared household bills')
      ) : (
        <>
          <div className="grid gap-[18px] md:grid-cols-2">
            <div>
              <Label tone="muted" htmlFor="account-rate">
                Interest rate (optional)
              </Label>
              <TextInput
                id="account-rate"
                inputMode="decimal"
                value={draft.interestRate}
                onChange={event => set({ interestRate: event.target.value })}
                placeholder="e.g. 4.5"
                autoComplete="off"
                suffix={<span className="pr-1 font-bold text-muted">%</span>}
                invalid={!!errors.interestRate}
                aria-describedby={errors.interestRate ? 'account-rate-error' : undefined}
              />
              {errors.interestRate ? (
                <FieldError id="account-rate-error">{errors.interestRate}</FieldError>
              ) : null}
            </div>
            {purpose('e.g. Holiday fund')}
          </div>

          {beforeCounts}

          <div className={panelClasses}>
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <span id="account-counts" className="text-sm font-bold">
                Count in free to spend
              </span>
              <span className="text-xs font-semibold text-muted">
                {draft.counts
                  ? 'Adds to the bank balance on your dashboard'
                  : 'Kept out of free to spend. Money you’ve put aside isn’t money to spend.'}
              </span>
            </span>
            <Switch
              checked={draft.counts}
              onCheckedChange={counts => set({ counts })}
              aria-labelledby="account-counts"
            />
          </div>
        </>
      )}
    </>
  );
};
