import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { DELETE_BILL_MUTATION, deleteBillCache } from '~/graphql';
import { User } from '~/types';

interface DeleteSelectedBillProps {
  billId: string;
  user: User;
}

export const useDeleteBill = (onSuccess?: () => void) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [deleteBill, { loading }] = useMutation(DELETE_BILL_MUTATION);

  const deleteSelectedBill = ({ billId, user }: DeleteSelectedBillProps) => {
    deleteBill({
      variables: { id: billId },
      update: (
        cache,
        {
          data: {
            deleteBill: { bill }
          }
        }
      ) => deleteBillCache(cache, bill, user),
      onCompleted: () => {
        enqueueSnackbar(`Bill deleted`, { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { deleteSelectedBill, loading };
};
