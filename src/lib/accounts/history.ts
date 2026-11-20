import { AccountHistoryQuery } from '~/graphql/generated';
import { fromApiDate } from '../dates';
import { formatMoney, roundPence } from '../format';
import { Account } from './accounts';
import { interestPerPayment } from './interest';

type ChangeRecord = NonNullable<AccountHistoryQuery['account']>['history'][number];

type BalanceChangeKind = ChangeRecord['kind'] | 'DUE';

// The tag a change wears: the next interest in the accent, interest added in green
type BalanceChangeTone = 'accent' | 'green' | 'plain';

export interface BalanceChange {
  id: string;
  kind: BalanceChangeKind;
  date: Date;
  // "Interest added", "Moved in"
  label: string;
  tone: BalanceChangeTone;
  // Beside the label: the payment, the other account, or the balance before one typed in
  note: string | null;
  // How far it moved the balance; none for the opening balance
  change: number | null;
  balanceAfter: number;
  // The next interest, worked out ahead of time
  estimate: boolean;
}

const LABELS: Record<BalanceChangeKind, string> = {
  DUE: 'Interest due',
  OPENING: 'Opening balance',
  BALANCE_SET: 'Balance updated',
  INTEREST: 'Interest added',
  PAYMENT: 'Paid',
  MOVE_IN: 'Moved in',
  MOVE_OUT: 'Moved out'
};

const noteOf = (record: ChangeRecord) => {
  switch (record.kind) {
    case 'BALANCE_SET':
      return `Was ${formatMoney(roundPence(record.balanceAfter - record.change))}`;
    case 'PAYMENT':
      return record.name;
    case 'MOVE_IN':
      return record.name ? `From ${record.name}` : null;
    case 'MOVE_OUT':
      return record.name ? `To ${record.name}` : null;
    default:
      return null;
  }
};

/*
 * An account's balance changes, newest first. A savings account with interest on a schedule is led
 * by its next payment, with what it's likely to leave, as a debt is led by its next payment.
 */
export const balanceChanges = (
  account: Pick<Account, 'balance' | 'interest'>,
  { records, next }: { records: readonly ChangeRecord[]; next: boolean }
): BalanceChange[] => {
  const changes = records.map((record): BalanceChange => ({
    id: record.id,
    kind: record.kind,
    date: fromApiDate(record.date)!,
    label: LABELS[record.kind],
    tone: record.kind === 'INTEREST' ? 'green' : 'plain',
    note: noteOf(record),
    change: record.kind === 'OPENING' ? null : record.change,
    balanceAfter: record.balanceAfter,
    estimate: false
  }));
  const { interest } = account;
  // A fixed term pays once, at the end, so there's no next payment to work out
  if (!next || !interest?.frequency || interest.frequency === 'MATURITY' || !interest.nextDate) {
    return changes;
  }
  const added = interestPerPayment(account.balance, {
    rate: interest.rate,
    frequency: interest.frequency
  });
  return [
    {
      id: 'next',
      kind: 'DUE',
      date: interest.nextDate,
      label: LABELS.DUE,
      tone: 'accent',
      note: null,
      change: added,
      balanceAfter: roundPence(account.balance + added),
      estimate: true
    },
    ...changes
  ];
};

/* What the interest added in a year came to: "£118.10 interest in 2026", or nothing without any */
export const interestInYear = (changes: readonly BalanceChange[], year: number) => {
  const added = changes.filter(change => change.kind === 'INTEREST');
  if (!added.length) return null;
  const total = roundPence(added.reduce((sum, change) => sum + (change.change ?? 0), 0));
  return `${formatMoney(total)} interest in ${year}`;
};
