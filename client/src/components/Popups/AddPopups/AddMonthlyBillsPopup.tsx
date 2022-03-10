import { Dispatch } from 'react';
import { useMutation } from '@apollo/client';
import { EVENTS } from '../../../constants';
import { useAccountContext } from '../../../state/account-context';
import { CREATE_BILL_MUTATION } from '../../../graphql';
import { Bill } from '../../../interfaces';
import { MonthlyBillsPopup } from '../PopupForms';

interface AddMonthlyBillsPopupProps {
  open: boolean;
  setOpen: Dispatch<boolean>;
}

export const AddMonthlyBillsPopup = ({
  open,
  setOpen
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

  return (
    <MonthlyBillsPopup
      title="Add a new monthly bill"
      onSave={createNewBill}
      open={open}
      setOpen={setOpen}
    />
  );
};
