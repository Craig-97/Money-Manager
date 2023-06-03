import { useMutation } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import { DispatchWithoutAction } from 'react';
import {
  DELETE_BILL_MUTATION,
  EDIT_ACCOUNT_MUTATION,
  EDIT_BILL_MUTATION,
  deleteBillCache,
  editAccountCache
} from '~/graphql';
import { useAccountContext } from '~/state';
import { Bill } from '~/types';
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
  const { bankBalance, id } = account;
  const { id: billId, name, amount, paid }: Bill = selectedBill;
  const { enqueueSnackbar } = useSnackbar();

  const [editBill, { loading: billLoading }] = useMutation(EDIT_BILL_MUTATION);

  const editSelectedBill = (bill: Bill) => {
    editBill({
      variables: { id: billId, bill },
      onCompleted: data => onEditBillCompleted(data),
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
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
          ) => editAccountCache(cache, account, user),
          onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
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
      ) => deleteBillCache(cache, bill, user),
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
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
      onSave={editSelectedBill}
      onDelete={deleteSelectedBill}
      isOpen={isOpen}
      close={close}
      defaultName={name}
      defaultAmount={amount}
      defaultPaid={paid}
    />
  ) : null;
};
