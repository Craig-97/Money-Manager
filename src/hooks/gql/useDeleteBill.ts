import { useMutation } from '@apollo/client/react';
import { useErrorHandler } from '../useErrorHandler';
import { DELETE_BILL_MUTATION, deleteBillCache } from '~/graphql';
import { useSnackbar, useUserContext } from '~/state';

interface DeleteSelectedBillProps {
  billId: string;
}

export const useDeleteBill = (onSuccess?: () => void) => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [deleteBill, { loading }] = useMutation(DELETE_BILL_MUTATION);

  const deleteSelectedBill = ({ billId }: DeleteSelectedBillProps) => {
    deleteBill({
      variables: { id: billId },
      update: (cache, { data }) => {
        const bill = data?.deleteBill?.bill;
        if (!bill) return;
        deleteBillCache(cache, bill, user);
      },
      onCompleted: () => {
        enqueueSnackbar(`Bill deleted`, { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { deleteSelectedBill, loading };
};
