import { useMutation } from '@apollo/client';
import { DispatchWithoutAction } from 'react';
import { deleteBillCache, DELETE_BILL_MUTATION, EDIT_BILL_MUTATION } from '../../../graphql';
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
  const { id, name, amount, paid }: Bill = selectedBill;

  const [editBill] = useMutation(EDIT_BILL_MUTATION);

  const editNewBill = (bill: Bill) => {
    editBill({
      variables: { id, bill }
    });
  };

  const [deleteBill] = useMutation(DELETE_BILL_MUTATION);

  const deleteSelectedBill = () => {
    deleteBill({
      variables: { id },
      update: (
        cache,
        {
          data: {
            deleteBill: { bill }
          }
        }
      ) => deleteBillCache(cache, bill)
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
