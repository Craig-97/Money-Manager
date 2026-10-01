import { useMutation } from '@apollo/client/react';
import { useEditAccount } from './useEditAccount';
import { useErrorHandler } from '../useErrorHandler';
import { DELETE_ONE_OFF_PAYMENT_MUTATION, deletePaymentCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { useUserContext } from '~/state';
import { DeletePaymentResponse, OneOffPayment } from '~/types';

interface DeleteOffPaymentResult {
  deleteOneOffPayment: {
    oneOffPayment: OneOffPayment;
    success: boolean;
  };
}

interface DeleteSelectedPaymentProps {
  paymentId: string;
  paid: boolean;
  currentBankBalance: number;
}

export const useDeletePayment = (onSuccess?: () => void) => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();
  const { updateAccount } = useEditAccount();

  const [deletePayment, { loading }] = useMutation<DeleteOffPaymentResult>(
    DELETE_ONE_OFF_PAYMENT_MUTATION
  );

  const deleteSelectedPayment = ({
    paymentId,
    paid,
    currentBankBalance
  }: DeleteSelectedPaymentProps) => {
    deletePayment({
      variables: { id: paymentId },
      update: (cache, { data }) => {
        const payment = data?.deleteOneOffPayment?.oneOffPayment;
        if (!payment) return;
        deletePaymentCache(cache, payment, user);
      },
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
