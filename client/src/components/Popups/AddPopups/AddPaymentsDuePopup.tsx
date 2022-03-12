import { DispatchWithoutAction } from 'react';
import { ApolloCache, useMutation } from '@apollo/client';
import { CREATE_ONE_OFF_PAYMENT_MUTATION, GET_ACCOUNT_QUERY } from '../../../graphql';
import { AccountData, OneOffPayment } from '../../../interfaces';
import { PaymentsDuePopup } from '../PopupForms';
import { getNewOneOffPaymentAdded } from '../../../utils';
interface AddPaymentsDuePopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
}

export const AddPaymentsDuePopup = ({ isOpen, close }: AddPaymentsDuePopupProps) => {
  const [createOneOffPayment] = useMutation(CREATE_ONE_OFF_PAYMENT_MUTATION);

  const createNewOneOffPayment = (oneOffPayment: OneOffPayment) => {
    createOneOffPayment({
      variables: { oneOffPayment },
      update: (
        cache,
        {
          data: {
            createOneOffPayment: { oneOffPayment }
          }
        }
      ) => addPaymentCache(cache, oneOffPayment)
    });
  };

  const addPaymentCache = (cache: ApolloCache<any>, oneOffPayment: OneOffPayment) => {
    const data: AccountData | null = cache.readQuery({
      query: GET_ACCOUNT_QUERY
    });

    if (data) {
      cache.writeQuery({
        query: GET_ACCOUNT_QUERY,
        data: getNewOneOffPaymentAdded(data?.account, oneOffPayment)
      });
    }
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
