import { useShallow } from 'zustand/react/shallow';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { PaymentTab } from '../../dashboardModel';

/* Opens the right add form for the tab: upcoming asks which kind first */
export const useAddForTab = (tab: PaymentTab) => {
  const { openAdd, openChooser } = usePaymentDialogStore(
    useShallow(s => ({ openAdd: s.openAdd, openChooser: s.openChooser }))
  );
  return () =>
    tab === 'recurring'
      ? openAdd('recurring')
      : tab === 'oneOff'
        ? openAdd('oneOff')
        : openChooser();
};
