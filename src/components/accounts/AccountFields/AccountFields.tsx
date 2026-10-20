import { ReactNode } from 'react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { TextInput } from '~/components/form/TextInput';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { Switch } from '~/components/ui/Switch';
import { AccountKind } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { AccountDraft, AccountDraftErrors } from '../accountDraft';

export const helpClasses = 'mt-2 ml-1 text-xs font-semibold text-muted';
export const panelClasses =
  'flex items-center gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3.5';

const KINDS: { value: AccountKind; label: string }[] = [
  { value: 'SPENDING', label: 'Spending' },
  { value: 'SAVINGS', label: 'Savings' }
];

const KIND_HINTS: Record<AccountKind, string> = {
  SPENDING: 'Money you pay bills and spending from. It counts in free to spend.',
  SAVINGS: 'Money you put aside. It stays out of free to spend unless you switch it on.'
};

const PLACEHOLDERS: Record<AccountKind, { name: string; purpose: string }> = {
  SPENDING: { name: 'e.g. Joint bills', purpose: 'e.g. Shared household bills' },
  SAVINGS: { name: 'e.g. Easy access', purpose: 'e.g. Holiday fund' }
};

interface AccountFieldsProps {
  draft: AccountDraft;
  set: (fields: Partial<AccountDraft>) => void;
  errors: AccountDraftErrors;
  canChangeKind: boolean;
  // Shown after the type, e.g. the "Where you get paid" switch
  afterKind?: ReactNode;
  // Shown before the count switch for savings, e.g. the payments that pay in
  beforeCounts?: ReactNode;
  // The count switch, hidden where pay lands as that always counts
  showCounts?: boolean;
}

/*
 * An account's fields, the same wherever one is added or changed: the balance first, its name and
 * what it's for, its type beside a savings rate, and whether it counts in free to spend.
 * Changing the type starts the count switch where that type usually is.
 */
export const AccountFields = ({
  draft,
  set,
  errors,
  canChangeKind,
  afterKind,
  beforeCounts,
  showCounts = true
}: AccountFieldsProps) => {
  const placeholders = PLACEHOLDERS[draft.kind];
  const savings = draft.kind === 'SAVINGS';

  return (
    <>
      <div>
        <Label tone="muted" htmlFor="account-balance">
          Balance now
        </Label>
        <AmountInput
          id="account-balance"
          size="hero"
          boxClassName="rounded-full"
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
          </p>
        )}
      </div>

      <div className="grid gap-[18px] md:grid-cols-2 md:gap-3.5">
        <div>
          <Label tone="muted" htmlFor="account-name">
            Name
          </Label>
          <TextInput
            id="account-name"
            value={draft.name}
            onChange={event => set({ name: event.target.value })}
            placeholder={placeholders.name}
            maxLength={50}
            autoComplete="off"
            invalid={!!errors.name}
            aria-describedby={errors.name ? 'account-name-error' : undefined}
          />
          {errors.name ? <FieldError id="account-name-error">{errors.name}</FieldError> : null}
        </div>
        <div>
          <Label tone="muted" htmlFor="account-purpose">
            What it’s for (optional)
          </Label>
          <TextInput
            id="account-purpose"
            value={draft.purpose}
            onChange={event => set({ purpose: event.target.value })}
            placeholder={placeholders.purpose}
            maxLength={60}
            autoComplete="off"
            invalid={!!errors.purpose}
            aria-describedby={errors.purpose ? 'account-purpose-error' : undefined}
          />
          {errors.purpose ? (
            <FieldError id="account-purpose-error">{errors.purpose}</FieldError>
          ) : null}
        </div>
      </div>

      {canChangeKind || savings ? (
        <div>
          {/* Type and the rate side by side on desktop; a spending account's type has the row */}
          <div className={cn('grid gap-[18px]', savings && 'md:grid-cols-2 md:gap-3.5')}>
            {canChangeKind ? (
              <div>
                <p id="account-kind" className="mb-2 text-[13px] font-bold text-muted">
                  Type
                </p>
                <SegmentedControl
                  aria-labelledby="account-kind"
                  value={draft.kind}
                  onValueChange={kind => set({ kind, counts: kind === 'SPENDING' })}
                  options={KINDS}
                  size="lg"
                  fullWidth
                />
                {/* Under the type on a phone, under the whole row on desktop */}
                <p className={cn(helpClasses, savings && 'md:hidden')}>{KIND_HINTS[draft.kind]}</p>
              </div>
            ) : null}
            {savings ? (
              <div>
                <Label tone="muted" htmlFor="account-rate">
                  Interest rate (optional)
                </Label>
                <TextInput
                  id="account-rate"
                  inputMode="decimal"
                  value={draft.interestRate}
                  onChange={event => set({ interestRate: event.target.value })}
                  placeholder="0.0"
                  autoComplete="off"
                  suffix={<span className="pr-1 font-bold text-muted">%</span>}
                  invalid={!!errors.interestRate}
                  aria-describedby={errors.interestRate ? 'account-rate-error' : undefined}
                />
                {errors.interestRate ? (
                  <FieldError id="account-rate-error">{errors.interestRate}</FieldError>
                ) : null}
              </div>
            ) : null}
          </div>
          {canChangeKind && savings ? (
            <p className={cn(helpClasses, 'hidden md:block')}>{KIND_HINTS[draft.kind]}</p>
          ) : null}
        </div>
      ) : null}

      {afterKind}

      {savings ? beforeCounts : null}

      {showCounts ? (
        <div className={panelClasses}>
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span id="account-counts" className="text-sm font-bold">
              Count in free to spend
            </span>
            <span className="text-xs font-semibold text-muted">
              {draft.counts
                ? 'Adds to the bank balance on your dashboard'
                : 'Kept out of free to spend'}
            </span>
          </span>
          <Switch
            checked={draft.counts}
            onCheckedChange={counts => set({ counts })}
            aria-labelledby="account-counts"
          />
        </div>
      ) : null}
    </>
  );
};
