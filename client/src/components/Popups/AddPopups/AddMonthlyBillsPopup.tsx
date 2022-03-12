import { DispatchWithoutAction } from 'react';
import { ApolloCache, useMutation } from '@apollo/client';
import { CREATE_BILL_MUTATION, GET_ACCOUNT_QUERY } from '../../../graphql';
import { AccountData, Bill } from '../../../interfaces';
import { MonthlyBillsPopup } from '../PopupForms';
import { getNewBillAdded } from '../../../utils';

interface AddMonthlyBillsPopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
}

export const AddMonthlyBillsPopup = ({ isOpen, close }: AddMonthlyBillsPopupProps) => {
  const [createBill] = useMutation(CREATE_BILL_MUTATION);

  const createNewBill = (bill: Bill) => {
    createBill({
      variables: { bill },
      update: (
        cache,
        {
          data: {
            createBill: { bill }
          }
        }
      ) => addBillCache(cache, bill)
    });
  };

  const addBillCache = (cache: ApolloCache<any>, bill: Bill) => {
    const data: AccountData | null = cache.readQuery({
      query: GET_ACCOUNT_QUERY
    });

    if (data) {
      cache.writeQuery({
        query: GET_ACCOUNT_QUERY,
        data: getNewBillAdded(data?.account, bill)
      });
    }
  };

  return isOpen ? (
    <MonthlyBillsPopup
      title="Add Monthly Bill"
      onSave={createNewBill}
      isOpen={isOpen}
      close={close}
    />
  ) : null;
};
