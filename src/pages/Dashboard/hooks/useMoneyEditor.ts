import { KeyboardEvent, useState } from 'react';
import { formatMoneyInput, parseMoney } from '~/lib/format';

/*
 * Editing an amount in place: Enter or the tick saves, Escape or the cross cancels. An amount
 * that isn't a number keeps the field open.
 */
export const useMoneyEditor = (value: number, save: (amount: number) => Promise<unknown>) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = async () => {
    if (draft === null) return;
    const amount = parseMoney(draft);
    if (amount === null) return;
    setDraft(null);
    if (amount !== value) await save(amount);
  };

  return {
    editing: draft !== null,
    draft: draft ?? '',
    setDraft,
    start: () => setDraft(formatMoneyInput(value)),
    cancel: () => setDraft(null),
    commit: () => void commit(),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter') void commit();
      if (event.key === 'Escape') setDraft(null);
    }
  };
};

export type MoneyEditor = ReturnType<typeof useMoneyEditor>;
