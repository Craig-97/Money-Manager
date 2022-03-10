import { DispatchWithoutAction } from 'react';
import { useMutation } from '@apollo/client';
import { EVENTS } from '../../../constants';
import { useAccountContext } from '../../../state/account-context';
import { CREATE_BILL_MUTATION } from '../../../graphql';
import { Bill } from '../../../interfaces';
import { MonthlyBillsPopup } from '../PopupForms';

interface AddMonthlyBillsPopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
}

export const AddMonthlyBillsPopup = ({
  isOpen,
  close
}: AddMonthlyBillsPopupProps) => {
  const { dispatch } = useAccountContext();

  const [createBill] = useMutation(CREATE_BILL_MUTATION, {
    onCompleted: data => onCompleted(data)
  });

  const onCompleted = (data: any) => {
    if (data?.createBill) {
      const {
        createBill: { bill }
      } = data;
      dispatch({ type: EVENTS.CREATE_NEW_BILL, data: bill });
    }
  };

  const createNewBill = (bill: Bill) => {
    createBill({
      variables: { bill }
    });
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
