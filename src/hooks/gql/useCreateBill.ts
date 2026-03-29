import { useMutation } from '@apollo/client/react';
import { useErrorHandler } from '../useErrorHandler';
import { CREATE_BILL_MUTATION, addBillCache } from '~/graphql';
import { useSnackbar, useUserContext } from '~/state';
import { Bill } from '~/types';

interface CreateBillResult {
  createBill: {
    bill: Bill;
  };
}

interface CreateBillParams {
  bill: Bill;
}

export const useCreateBill = (onSuccess?: () => void) => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [createBill, { loading }] = useMutation<CreateBillResult>(CREATE_BILL_MUTATION);

  const createNewBill = ({ bill }: CreateBillParams) => {
    createBill({
      variables: { bill },
      update: (cache, { data }) => {
        const bill = data?.createBill?.bill;
        if (!bill) return;
        addBillCache(cache, bill, user);
      },
      onCompleted: () => {
        enqueueSnackbar(`${bill.name} bill added`, { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { createNewBill, loading };
};
