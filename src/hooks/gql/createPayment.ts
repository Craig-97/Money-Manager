import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { CREATE_ONE_OFF_PAYMENT_MUTATION, addPaymentCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { OneOffPayment, User } from '~/types';

interface CreatePaymentParams {
  oneOffPayment: OneOffPayment;
  user: User;
}

export const useCreatePayment = (onSuccess?: () => void) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [createOneOffPayment, { loading }] = useMutation(CREATE_ONE_OFF_PAYMENT_MUTATION);

  const createNewPayment = ({ oneOffPayment, user }: CreatePaymentParams) => {
    createOneOffPayment({
      variables: { oneOffPayment },
      update: (
        cache,
        {
          data: {
            createOneOffPayment: { oneOffPayment }
          }
        }
      ) => addPaymentCache(cache, oneOffPayment, user),
      onCompleted: () => {
        enqueueSnackbar(`${oneOffPayment.name} payment added`, { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { createNewPayment, loading };
};
