import { useMutation } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import { DispatchWithoutAction } from 'react';
import {
  DELETE_ONE_OFF_PAYMENT_MUTATION,
  EDIT_ACCOUNT_MUTATION,
  EDIT_ONE_OFF_PAYMENT_MUTATION,
  deletePaymentCache,
  editAccountCache
} from '~/graphql';
import { useAccountContext } from '~/state/account-context';
import { OneOffPayment } from '~/types';
import { PaymentsDuePopup } from '../FormPopups';

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
  const {
    state: { account, user }
  } = useAccountContext();
  const { bankBalance, id } = account;
  const { id: paymentId, name, amount }: OneOffPayment = selectedPayment;
  const { enqueueSnackbar } = useSnackbar();

  const [editPayment, { loading: editPayLoading }] = useMutation(EDIT_ONE_OFF_PAYMENT_MUTATION);

  const editSelectedPayment = (oneOffPayment: OneOffPayment) => {
    editPayment({
      variables: { id: paymentId, oneOffPayment },
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
    });
  };

  const [deletePayment, { loading: delPayLoading }] = useMutation(DELETE_ONE_OFF_PAYMENT_MUTATION);

  const deleteSelectedPayment = () => {
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
      onCompleted: data => onPaymentDeleted(data),
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
    });
  };

  const [editAccount, { loading: editAccLoading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const onPaymentDeleted = (response: any) => {
    const {
      deleteOneOffPayment: { oneOffPayment, success }
    } = response;

    if (success) {
      const newBalance = bankBalance - oneOffPayment?.amount;
      if (!isNaN(newBalance)) {
        // Updates bankBalance automatically when payment is removed
        editAccount({
          variables: { id, account: { bankBalance: newBalance } },
          update: (
            cache,
            {
              data: {
                editAccount: { account }
              }
            }
          ) => editAccountCache(cache, account, user),
          onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
        });
      }
    }
  };

  if (editAccLoading || editPayLoading || delPayLoading) {
    return (
      <div className="loading">
        <CircularProgress />
      </div>
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
