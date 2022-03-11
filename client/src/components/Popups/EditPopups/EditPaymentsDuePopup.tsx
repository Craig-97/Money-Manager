import { useMutation } from '@apollo/client';
import { DispatchWithoutAction } from 'react';
import { EVENTS } from '../../../constants';
import {
  DELETE_ONE_OFF_PAYMENT_MUTATION,
  EDIT_ACCOUNT_MUTATION,
  EDIT_ONE_OFF_PAYMENT_MUTATION,
  GET_ACCOUNT_QUERY
} from '../../../graphql';
import { OneOffPayment, Account } from '../../../interfaces';
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
    state: { account },
    dispatch
  } = useAccountContext();
  const { bankBalance, id }: Account = account;
  const { id: paymentId, name, amount }: OneOffPayment = selectedPayment;

  const [editPayment] = useMutation(EDIT_ONE_OFF_PAYMENT_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  const editNewPayment = (oneOffPayment: OneOffPayment) => {
    editPayment({
      variables: { id: paymentId, oneOffPayment }
    });
  };
  const [editAccount] = useMutation(EDIT_ACCOUNT_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  const [deletePayment] = useMutation(DELETE_ONE_OFF_PAYMENT_MUTATION, {
    onCompleted: data => onPaymentDeleted(data)
  });

  const onPaymentDeleted = (response: any) => {
    const {
      deleteOneOffPayment: { oneOffPayment, success }
    } = response;

    if (success) {
      const newBalance = bankBalance - oneOffPayment?.amount;
      if (!isNaN(newBalance)) {
        // Updates bankBalance automatically when payment due is removed
        editAccount({
          variables: { id, account: { bankBalance: newBalance } }
        });
      }
      dispatch({ type: EVENTS.DELETE_ONE_OFF_PAYMENT, data: paymentId });
    }
  };

  const deleteSelectedPayment = () => {
    deletePayment({
      variables: { id: paymentId }
    });
  };

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
