import { useMutation } from '@apollo/client/react';
import { useErrorHandler } from '../useErrorHandler';
import { CREATE_ONE_OFF_PAYMENT_MUTATION, addPaymentCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { OneOffPayment, User } from '~/types';

interface CreatePaymentParams {
  oneOffPayment: OneOffPayment;
  user: User;
}

interface CreateOneOffPaymentResult {
  createOneOffPayment: {
    oneOffPayment: OneOffPayment;
  };
}

export const useCreatePayment = (onSuccess?: () => void) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [createOneOffPayment, { loading }] = useMutation<CreateOneOffPaymentResult>(
    CREATE_ONE_OFF_PAYMENT_MUTATION
  );

  const createNewPayment = ({ oneOffPayment, user }: CreatePaymentParams) => {
    createOneOffPayment({
      variables: { oneOffPayment },
      update: (cache, { data }) => {
        const payment = data?.createOneOffPayment?.oneOffPayment;
        if (!payment) return;
        addPaymentCache(cache, payment, user);
      },
      onCompleted: () => {
        enqueueSnackbar(`${oneOffPayment.name} payment added`, { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { createNewPayment, loading };
};
