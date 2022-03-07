import { Dispatch } from 'react';
import { useMutation } from '@apollo/client';
import { events } from '../../constants';
import { useAccountContext } from '../../state/account-context';
import { EDIT_BILL_MUTATION, GET_ACCOUNT_QUERY } from '../../graphql';
import { Bill } from '../../interfaces';
import { MonthlyBillsPopup } from './MonthlyBillsPopup';

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
  const { id, name, amount, paid }: Bill = selectedBill;

  const [editBill] = useMutation(EDIT_BILL_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  const editNewBill = (bill: Bill) => {
    editBill({
      variables: { id, bill }
    });
  };

  return (
    <MonthlyBillsPopup
      title="Edit monthly bill"
      onSave={editNewBill}
      open={open}
      setOpen={setOpen}
      defaultName={name}
      defaultAmount={amount?.toString()}
      defaultPaid={paid}
    />
  );
};
