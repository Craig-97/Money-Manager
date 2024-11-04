import { useMutation } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { DispatchWithoutAction } from 'react';
import {
  DELETE_ONE_OFF_PAYMENT_MUTATION,
  EDIT_ONE_OFF_PAYMENT_MUTATION,
  deletePaymentCache
} from '~/graphql';
import { useAccountContext } from '~/state/account-context';
import { DeletePaymentResponse, OneOffPayment } from '~/types';
import { PaymentsDuePopup } from '../FormPopups';
import { useErrorHandler, useEditAccount } from '~/hooks';

interface EditPaymentsDuePopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
  selectedPayment: OneOffPayment;
}

export const EditPaymentsDuePopup = ({
  isOpen,
  close,
  selectedPayment
}: EditPaymentsDuePopupProps) => {
  const { account, user } = useAccountContext();
  const { bankBalance } = account;
  const { id: paymentId, name, amount }: OneOffPayment = selectedPayment;
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();
  const { updateAccount, loading: editAccLoading } = useEditAccount();

  const [editPayment, { loading: editPayLoading }] = useMutation(EDIT_ONE_OFF_PAYMENT_MUTATION);

  const editSelectedPayment = (oneOffPayment: OneOffPayment) => {
    editPayment({
      variables: { id: paymentId, oneOffPayment },
      onCompleted: () =>
        enqueueSnackbar(`${oneOffPayment.name} payment updated`, { variant: 'success' }),
      onError: handleGQLError
    });
  };

  const [deletePayment, { loading: delPayLoading }] = useMutation(DELETE_ONE_OFF_PAYMENT_MUTATION);

  const deleteSelectedPayment = (paid: boolean) => {
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
      onCompleted: data => onPaymentDeleted(data, paid),
      onError: handleGQLError
    });
  };

  const onPaymentDeleted = (response: DeletePaymentResponse, paid: boolean) => {
    const {
      deleteOneOffPayment: { oneOffPayment, success }
    } = response;

    if (success) {
      const message = paid
        ? `£${oneOffPayment.amount} deducted from Bank Total`
        : 'Payment deleted';
      enqueueSnackbar(message, { variant: 'success' });

      const newBalance = bankBalance - (oneOffPayment?.amount || 0);
      if (!isNaN(newBalance) && paid) {
        updateAccount({ bankBalance: newBalance });
      }
    }
  };

  if (editAccLoading || editPayLoading || delPayLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isOpen ? (
    <PaymentsDuePopup
      title="Edit Upcoming Payment"
      onSave={editSelectedPayment}
      isOpen={isOpen}
      close={close}
      onDelete={deleteSelectedPayment}
      defaultName={name}
      defaultAmount={amount}
    />
  ) : null;
};
