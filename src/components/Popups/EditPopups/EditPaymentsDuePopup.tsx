import { useMutation } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import { DispatchWithoutAction } from 'react';
import {
  deletePaymentCache,
  DELETE_ONE_OFF_PAYMENT_MUTATION,
  editAccountCache,
  EDIT_ACCOUNT_MUTATION,
  EDIT_ONE_OFF_PAYMENT_MUTATION
} from '../../../graphql';
import { Account, OneOffPayment } from '../../../interfaces';
import { useAccountContext } from '../../../state/account-context';
import { PaymentsDuePopup } from '../PopupForms';
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
    state: { account }
  } = useAccountContext();
  const { bankBalance, id }: Account = account;
  const { id: paymentId, name, amount }: OneOffPayment = selectedPayment;

  const [editPayment, { loading: paymentLoading }] = useMutation(EDIT_ONE_OFF_PAYMENT_MUTATION);

  const editNewPayment = (oneOffPayment: OneOffPayment) => {
    editPayment({
      variables: { id: paymentId, oneOffPayment }
    });
  };

  const [deletePayment, { loading: delPaymentLoading }] = useMutation(
    DELETE_ONE_OFF_PAYMENT_MUTATION,
    {
      onCompleted: data => onPaymentDeleted(data)
    }
  );

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
      ) => deletePaymentCache(cache, oneOffPayment)
    });
  };

  const [editAccount, { loading: accLoading }] = useMutation(EDIT_ACCOUNT_MUTATION);

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
          ) => editAccountCache(cache, account)
        });
      }
    }
  };

  if (accLoading || paymentLoading || delPaymentLoading) {
    return (
      <div className="loading">
        <CircularProgress />
      </div>
    );
  }

  return isOpen ? (
    <PaymentsDuePopup
      title="Edit Upcoming Payment"
      onSave={editNewPayment}
      isOpen={isOpen}
      close={close}
      onDelete={deleteSelectedPayment}
      defaultName={name}
      defaultAmount={amount?.toString()}
    />
  ) : null;
};
