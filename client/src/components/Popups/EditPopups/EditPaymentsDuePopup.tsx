import { DispatchWithoutAction } from 'react';
import { EVENTS } from '../../../constants';
import { useMutation } from '@apollo/client';
import { useAccountContext } from '../../../state/account-context';
import {
  EDIT_ONE_OFF_PAYMENT_MUTATION,
  DELETE_ONE_OFF_PAYMENT_MUTATION,
  GET_ACCOUNT_QUERY
} from '../../../graphql';
import { OneOffPayment } from '../../../interfaces';
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
  const { dispatch } = useAccountContext();
  const { id, name, amount }: OneOffPayment = selectedPayment;

  const [editPayment] = useMutation(EDIT_ONE_OFF_PAYMENT_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  const editNewPayment = (oneOffPayment: OneOffPayment) => {
    editPayment({
      variables: { id, oneOffPayment }
    });
  };

  const [deletePayment] = useMutation(DELETE_ONE_OFF_PAYMENT_MUTATION, {
    onCompleted: () => dispatch({ type: EVENTS.DELETE_BILL, data: id })
  });

  const deleteSelectedPayment = () => {
    deletePayment({
      variables: { id }
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
