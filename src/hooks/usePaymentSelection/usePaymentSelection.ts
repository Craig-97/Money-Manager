import { useState } from 'react';
import { Payment } from '~/lib/payments';

/*
 * Ticked payments in a list, for the bulk actions. On mobile, select mode makes rows tick on tap
 * instead of opening, with the bulk actions in place of the nav.
 */
export const usePaymentSelection = (listed: Payment[]) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [selecting, setSelecting] = useState(false);

  // Only what's still listed counts, so a filtered-out payment is never acted on
  const selectedPayments = listed.filter(payment => selected.has(payment.id));
  const clear = () => setSelected(new Set());

  return {
    selected,
    selectedPayments,
    allSelected: listed.length > 0 && selectedPayments.length === listed.length,
    toggle: (id: string) =>
      setSelected(current => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
      }),
    selectAll: (all: boolean) =>
      setSelected(all ? new Set(listed.map(payment => payment.id)) : new Set()),
    clear,
    selecting,
    toggleSelecting: () => {
      setSelecting(current => !current);
      clear();
    },
    stopSelecting: () => {
      setSelecting(false);
      clear();
    }
  };
};
