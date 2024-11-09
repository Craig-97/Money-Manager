import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { EDIT_ONE_OFF_PAYMENT_MUTATION } from '~/graphql';
import { useSnackbar } from '~/state';
import { OneOffPayment } from '~/types';

interface EditSelectedPaymentProps {
  paymentId: string;
  payment: OneOffPayment;
}

export const useEditPayment = (onSuccess?: () => void) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [editPayment, { loading }] = useMutation(EDIT_ONE_OFF_PAYMENT_MUTATION);

  const editSelectedPayment = ({ paymentId, payment }: EditSelectedPaymentProps) => {
    editPayment({
      variables: { id: paymentId, oneOffPayment: payment },
      onCompleted: () => {
        enqueueSnackbar(`${payment.name} payment updated`, { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { editSelectedPayment, loading };
};
