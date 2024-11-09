import { useMutation } from '@apollo/client';
import { useEditAccount } from './editAccount';
import { useErrorHandler } from '../errorHandler';
import { DELETE_ONE_OFF_PAYMENT_MUTATION, deletePaymentCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { DeletePaymentResponse, User } from '~/types';

interface DeleteSelectedPaymentProps {
  paymentId: string;
  user: User;
  paid: boolean;
  currentBankBalance: number;
}

export const useDeletePayment = (onSuccess?: () => void) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();
  const { updateAccount } = useEditAccount();

  const [deletePayment, { loading }] = useMutation(DELETE_ONE_OFF_PAYMENT_MUTATION);

  const deleteSelectedPayment = ({
    paymentId,
    user,
    paid,
    currentBankBalance
  }: DeleteSelectedPaymentProps) => {
    deletePayment({
      variables: { id: paymentId },
      update: (
        cache,
        {
          data: {
            deleteOneOffPayment: { oneOffPayment }
          }
        }
      ) => deletePaymentCache(cache, oneOffPayment, user),
      onCompleted: (data: DeletePaymentResponse) => {
        onPaymentDeleted(data, paid, currentBankBalance);
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  const onPaymentDeleted = (
    response: DeletePaymentResponse,
    paid: boolean,
    currentBankBalance: number
  ) => {
    const {
      deleteOneOffPayment: { oneOffPayment, success }
    } = response;

    if (success) {
      const message = paid
        ? `£${oneOffPayment.amount} deducted from Bank Balance`
        : 'Payment deleted';
      enqueueSnackbar(message, { variant: 'success' });

      const newBalance = currentBankBalance - (oneOffPayment?.amount || 0);
      if (!isNaN(newBalance) && paid) {
        updateAccount({
          input: { bankBalance: newBalance }
        });
      }
    }
  };

  return { deleteSelectedPayment, loading };
};
