import { Payment } from './payments';

export type SortKey = 'date' | 'amount' | 'name';

export interface PaymentSort {
  key: SortKey;
  ascending: boolean;
}

// Each way to sort, and which way it starts when picked: soonest, largest, A–Z
export const SORT_KEYS: { key: SortKey; label: string; ascending: boolean }[] = [
  { key: 'date', label: 'Date', ascending: true },
  { key: 'amount', label: 'Amount', ascending: false },
  { key: 'name', label: 'Name', ascending: true }
];

// The mobile sort button steps through these in turn
const SORT_CYCLE: PaymentSort[] = [
  { key: 'date', ascending: true },
  { key: 'date', ascending: false },
  { key: 'amount', ascending: false },
  { key: 'name', ascending: true }
];

export const DEFAULT_SORT: PaymentSort = SORT_CYCLE[0];

/* "↑", "↓", or "A–Z" / "Z–A" for names */
export const sortDirection = ({ key, ascending }: PaymentSort) =>
  key === 'name' ? (ascending ? 'A–Z' : 'Z–A') : ascending ? '↑' : '↓';

/* "Date ↑", "Amount ↓", "Name A–Z" */
export const sortLabel = (sort: PaymentSort) =>
  `${SORT_KEYS.find(option => option.key === sort.key)!.label} ${sortDirection(sort)}`;

/* For screen readers: "Sort by date, earliest first" */
export const sortDescription = ({ key, ascending }: PaymentSort) =>
  key === 'date'
    ? `Sort by date, ${ascending ? 'earliest' : 'latest'} first`
    : key === 'amount'
      ? `Sort by amount, ${ascending ? 'lowest' : 'highest'} first`
      : `Sort by name, ${ascending ? 'A to Z' : 'Z to A'}`;

/* Picking the current key turns it round; another key starts from its own direction */
export const pickSort = (current: PaymentSort, key: SortKey): PaymentSort =>
  key === current.key
    ? { key, ascending: !current.ascending }
    : { key, ascending: SORT_KEYS.find(option => option.key === key)!.ascending };

/* The next step of the mobile sort button */
export const nextSort = (current: PaymentSort): PaymentSort => {
  const index = SORT_CYCLE.findIndex(
    sort => sort.key === current.key && sort.ascending === current.ascending
  );
  return SORT_CYCLE[(index + 1) % SORT_CYCLE.length];
};

const compare: Record<SortKey, (a: Payment, b: Payment) => number> = {
  date: (a, b) => a.dueDate!.getTime() - b.dueDate!.getTime(),
  amount: (a, b) => a.amount - b.amount,
  name: (a, b) => a.name.localeCompare(b.name, 'en-GB', { sensitivity: 'base' })
};

/* Payments in order. Ended payments have no date, so they go last whichever way dates sort. */
export const sortPayments = <T extends Payment>(payments: T[], { key, ascending }: PaymentSort) =>
  payments.toSorted((a, b) => {
    if (key === 'date' && (!a.dueDate || !b.dueDate)) {
      return a.dueDate === b.dueDate ? 0 : a.dueDate ? -1 : 1;
    }
    const order = compare[key](a, b);
    return ascending ? order : -order;
  });
