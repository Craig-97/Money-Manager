import { DispatchWithoutAction } from 'react';
import { useMutation } from '@apollo/client';
import { EVENTS } from '../../../constants';
import { useAccountContext } from '../../../state/account-context';
import { CREATE_ONE_OFF_PAYMENT_MUTATION } from '../../../graphql';
import { OneOffPayment } from '../../../interfaces';
import { PaymentsDuePopup } from '../PopupForms';

interface AddPaymentsDuePopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
}

export const AddPaymentsDuePopup = ({
  isOpen,
  close
}: AddPaymentsDuePopupProps) => {
  const { dispatch } = useAccountContext();

  const [createOneOffPayment] = useMutation(CREATE_ONE_OFF_PAYMENT_MUTATION, {
    onCompleted: data => onCompleted(data)
  });

  const onCompleted = (data: any) => {
    if (data?.createOneOffPayment) {
      const {
        createOneOffPayment: { oneOffPayment }
      } = data;
      dispatch({
        type: EVENTS.CREATE_NEW_ONE_OFF_PAYMENT,
        data: oneOffPayment
      });
    }
  };

  const createNewOneOffPayment = (oneOffPayment: OneOffPayment) => {
    createOneOffPayment({
      variables: { oneOffPayment }
    });
  };

  return isOpen ? (
    <PaymentsDuePopup
      title="Add Upcoming Payment"
      onSave={createNewOneOffPayment}
      isOpen={isOpen}
      close={close}
    />
  ) : null;
};
