import { DispatchWithoutAction } from 'react';
import { EVENTS } from '../../../constants';
import { useMutation } from '@apollo/client';
import { useAccountContext } from '../../../state/account-context';
import {
  EDIT_BILL_MUTATION,
  DELETE_BILL_MUTATION,
  GET_ACCOUNT_QUERY
} from '../../../graphql';
import { Bill } from '../../../interfaces';
import { MonthlyBillsPopup } from '../PopupForms';

interface EditMonthlyBillsPopupProps {
  isOpen: boolean;
  close: DispatchWithoutAction;
  selectedBill: Bill;
}

export const EditMonthlyBillsPopup = ({
  isOpen,
  close,
  selectedBill
}: EditMonthlyBillsPopupProps) => {
  const { dispatch } = useAccountContext();
  const { id, name, amount, paid }: Bill = selectedBill;

  const [editBill] = useMutation(EDIT_BILL_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  const editNewBill = (bill: Bill) => {
    editBill({
      variables: { id, bill }
    });
  };

  const [deleteBill] = useMutation(DELETE_BILL_MUTATION, {
    onCompleted: () => dispatch({ type: EVENTS.DELETE_BILL, data: id })
  });

  const deleteSelectedBill = () => {
    deleteBill({
      variables: { id }
    });
  };

  return isOpen ? (
    <MonthlyBillsPopup
      title="Edit Monthly Bill"
      onSave={editNewBill}
      onDelete={deleteSelectedBill}
      isOpen={isOpen}
      close={close}
      defaultName={name}
      defaultAmount={amount?.toString()}
      defaultPaid={paid}
    />
  ) : null;
};
