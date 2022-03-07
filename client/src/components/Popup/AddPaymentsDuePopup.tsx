import { Dispatch } from 'react';
import { useMutation } from '@apollo/client';
import { events } from '../../constants';
import { useAccountContext } from '../../state/account-context';
import { CREATE_ONE_OFF_PAYMENT_MUTATION } from '../../graphql';
import { OneOffPayment } from '../../interfaces';
import { PaymentsDuePopup } from './PaymentsDuePopup';

interface AddPaymentsDuePopupProps {
  open: boolean;
  setOpen: Dispatch<boolean>;
}

export const AddPaymentsDuePopup = ({
  open,
  setOpen
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
        type: events.CREATE_NEW_ONE_OFF_PAYMENT,
        data: oneOffPayment
      });
    }
  };

  const createNewOneOffPayment = (oneOffPayment: OneOffPayment) => {
    createOneOffPayment({
      variables: { oneOffPayment }
    });
  };

  return (
    <PaymentsDuePopup
      title="Add a new payment due"
      onSave={createNewOneOffPayment}
      open={open}
      setOpen={setOpen}
    />
  );
};
