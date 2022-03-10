import { Dispatch } from 'react';
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
  open: boolean;
  setOpen: Dispatch<boolean>;
  selectedBill: Bill;
}

export const EditMonthlyBillsPopup = ({
  open,
  setOpen,
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
    onCompleted: () => onDeleteCompleted()
  });

  const onDeleteCompleted = () => {
    dispatch({ type: EVENTS.DELETE_BILL, data: id });
  };

  const deleteSelectedBill = () => {
    deleteBill({
      variables: { id }
    });
  };

  return (
    <MonthlyBillsPopup
      title="Edit monthly bill"
      onSave={editNewBill}
      onDelete={deleteSelectedBill}
      open={open}
      setOpen={setOpen}
      defaultName={name}
      defaultAmount={amount?.toString()}
      defaultPaid={paid}
    />
  );
};
