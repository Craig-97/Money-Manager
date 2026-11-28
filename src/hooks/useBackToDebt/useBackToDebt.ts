import { useShallow } from 'zustand/react/shallow';
import { useDebtDialogStore } from '~/state/debtDialog';
import { useDebtViewStore } from '~/state/debtView';

/*
 * A debt's small dialog, opened from the debt's view, has a back arrow to it. Undefined when it was
 * opened another way, e.g. the ⋯ menu, so the dialog shows no arrow.
 */
export const useBackToDebt = (debtId: string | undefined) => {
  const { fromView, close } = useDebtDialogStore(
    useShallow(s => ({ fromView: s.fromView, close: s.close }))
  );
  const openView = useDebtViewStore(s => s.openFor);
  if (!fromView || !debtId) return undefined;
  return () => {
    close();
    openView(debtId);
  };
};
