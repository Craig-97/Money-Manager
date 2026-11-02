import { useShallow } from 'zustand/react/shallow';
import { useAccountQuickStore } from '~/state/accountQuick';
import { useAccountViewStore } from '~/state/accountView';

/* A small dialog opened from an account's view goes back to it; one from the menu has no way back */
export const useBackToAccount = (accountId: string | undefined) => {
  const { fromView, close } = useAccountQuickStore(
    useShallow(s => ({ fromView: s.fromView, close: s.close }))
  );
  const openView = useAccountViewStore(s => s.openFor);
  if (!fromView || !accountId) return undefined;
  return () => {
    close();
    openView(accountId);
  };
};
