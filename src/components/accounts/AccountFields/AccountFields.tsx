import { ReactNode, useState } from 'react';
import { AccountKind } from '~/graphql/generated';
import { cn } from '~/lib/cn';
import { parseMoney } from '~/lib/format';
import { AmountInput, FieldError, Label, TextInput } from '../../form';
import { MoreOptions, SegmentedControl, Switch } from '../../ui';
import { AccountDraft, AccountDraftErrors } from '../accountDraft';
import { InterestFields } from '../InterestFields';

const helpClasses = 'mt-2 ml-1 text-xs font-semibold text-muted';
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
  today: Date;
  // Changing an existing account's type, under More options. A new one's type was chosen first.
  canChangeKind: boolean;
  // An existing account: More options starts open when something in it isn't the default
  editing?: boolean;
  // Shown after the name, e.g. the "Where you get paid" switch
  afterKind?: ReactNode;
  // Shown after that for savings, e.g. the payments that pay in
  beforeCounts?: ReactNode;
  // The count switch, hidden where pay lands as that always counts
  showCounts?: boolean;
}

/*
 * An account's fields, the same wherever one is added or changed: the balance first, then its
 * name and, for savings, its interest. What most people leave alone, what it's for, whether it counts
 * in free to spend and its type, is under More options.
 */
export const AccountFields = ({
  draft,
  set,
  errors,
  today,
  canChangeKind,
  editing = false,
  afterKind,
  beforeCounts,
  showCounts = true
}: AccountFieldsProps) => {
  const placeholders = PLACEHOLDERS[draft.kind];
  const savings = draft.kind === 'SAVINGS';
  const usualCounts = draft.kind === 'SPENDING';
  const [moreOpen, setMoreOpen] = useState(
    () => editing && (!!draft.purpose.trim() || (showCounts && draft.counts !== usualCounts))
  );
  const moreSummary = [
    draft.purpose.trim() || 'What it’s for',
    canChangeKind ? draft.kind.toLowerCase() : null,
    showCounts ? (draft.counts ? 'counts in free to spend' : 'kept out of free to spend') : null
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <div>
        <Label tone="muted" htmlFor="account-balance">
          Balance now
        </Label>
        <AmountInput
          id="account-balance"
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

      {savings ? (
        <section
          aria-labelledby="account-interest"
          className="flex flex-col gap-3.5 border-t border-border pt-[18px]">
          <h3 id="account-interest" className="text-[15px] font-extrabold">
            Interest
          </h3>
          <InterestFields
            draft={draft.interest}
            set={fields => set({ interest: { ...draft.interest, ...fields } })}
            errors={errors}
            balance={parseMoney(draft.balance)}
            today={today}
          />
        </section>
      ) : null}

      {afterKind}

      {savings ? beforeCounts : null}

      <MoreOptions summary={moreSummary} open={moreOpen} onOpenChange={setMoreOpen}>
        <div>
          <Label tone="muted" htmlFor="account-purpose">
            What it’s for
          </Label>
          <TextInput
            id="account-purpose"
            value={draft.purpose}
            onChange={event => set({ purpose: event.target.value })}
            placeholder={placeholders.purpose}
            maxLength={60}
            autoComplete="off"
            boxClassName="bg-surface"
            invalid={!!errors.purpose}
            aria-describedby={errors.purpose ? 'account-purpose-error' : undefined}
          />
          {errors.purpose ? (
            <FieldError id="account-purpose-error">{errors.purpose}</FieldError>
          ) : null}
        </div>

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
              className="bg-surface"
            />
            <p className={helpClasses}>{KIND_HINTS[draft.kind]}</p>
          </div>
        ) : null}

        {showCounts ? (
          <div className={cn(panelClasses, 'bg-surface')}>
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
      </MoreOptions>
    </>
  );
};
