import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { CREATE_BILL_MUTATION, addBillCache } from '~/graphql';
import { useSnackbar, useUserContext } from '~/state';
import { Bill } from '~/types';

interface CreateBillParams {
  bill: Bill;
}

export const useCreateBill = (onSuccess?: () => void) => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [createBill, { loading }] = useMutation(CREATE_BILL_MUTATION);

  const createNewBill = ({ bill }: CreateBillParams) => {
    createBill({
      variables: { bill },
      update: (
        cache,
        {
          data: {
            createBill: { bill }
          }
        }
      ) => addBillCache(cache, bill, user),
      onCompleted: () => {
        enqueueSnackbar(`${bill.name} bill added`, { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { createNewBill, loading };
};
