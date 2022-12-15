import { useMutation } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import { DispatchWithoutAction } from 'react';
import {
  deleteBillCache,
  DELETE_BILL_MUTATION,
  editAccountCache,
  EDIT_ACCOUNT_MUTATION,
  EDIT_BILL_MUTATION
} from '~/graphql';
import { Account, Bill } from '~/types';
import { useAccountContext } from '~/state';
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
  const {
    state: { account, user }
  } = useAccountContext();
  const { bankBalance, id }: Account = account;
  const { id: billId, name, amount, paid }: Bill = selectedBill;

  const [editBill, { loading: billLoading }] = useMutation(EDIT_BILL_MUTATION, {
    onCompleted: data => onEditBillCompleted(data)
  });

  const editNewBill = (bill: Bill) => {
    editBill({
      variables: { id: billId, bill }
    });
  };

  const [editAccount, { loading: accLoading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const onEditBillCompleted = (response: any) => {
    const {
      editBill: { bill, success }
    } = response;

    if (success && !selectedBill?.paid && bill?.paid) {
      const newBalance = bankBalance - bill?.amount;
      if (!isNaN(newBalance)) {
        // Updates bankBalance automatically when bill is marked as paid
        editAccount({
          variables: { id, account: { bankBalance: newBalance } },
          update: (
            cache,
            {
              data: {
                editAccount: { account }
              }
            }
          ) => editAccountCache(cache, account, user)
        });
      }
    }
  };

  const [deleteBill, { loading: delBillLoading }] = useMutation(DELETE_BILL_MUTATION);

  const deleteSelectedBill = () => {
    deleteBill({
      variables: { id: billId },
      update: (
        cache,
        {
          data: {
            deleteBill: { bill }
          }
        }
      ) => deleteBillCache(cache, bill, user)
    });
  };

  if (accLoading || billLoading || delBillLoading) {
    return (
      <div className="loading">
        <CircularProgress />
      </div>
    );
  }

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
