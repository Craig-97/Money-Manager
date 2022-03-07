import { Dispatch } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BILL_MUTATION, GET_ACCOUNT_QUERY } from '../../graphql';
import { Bill } from '../../interfaces';
import { MonthlyBillsPopup } from './MonthlyBillsPopup';

interface AddMonthlyBillsPopupProps {
  open: boolean;
  setOpen: Dispatch<boolean>;
}

export const AddMonthlyBillsPopup = ({
  open,
  setOpen
}: AddMonthlyBillsPopupProps) => {
  const [createBill] = useMutation(CREATE_BILL_MUTATION, {
    refetchQueries: [{ query: GET_ACCOUNT_QUERY }]
  });

  const createNewBill = (bill: Bill) => {
    createBill({
      variables: { bill }
    });
  };

  return (
    <MonthlyBillsPopup
      title="Add a new monthly bill"
      onSave={createNewBill}
      open={open}
      setOpen={setOpen}
    />
  );
};
