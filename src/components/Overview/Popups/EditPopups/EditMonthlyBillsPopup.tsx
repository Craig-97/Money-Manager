import { DispatchWithoutAction } from 'react';
import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import { MonthlyBillsPopup } from '../FormPopups';
import { DELETE_BILL_MUTATION, EDIT_BILL_MUTATION, deleteBillCache } from '~/graphql';
import { useErrorHandler, useEditAccount } from '~/hooks';
import { useAccountContext } from '~/state';
import { Bill, EditBillResponse } from '~/types';

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
  const { account, user } = useAccountContext();
  const { bankBalance } = account;
  const { id: billId, name, amount, paid }: Bill = selectedBill;
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [editBill, { loading: editBillLoading }] = useMutation(EDIT_BILL_MUTATION);

  const editSelectedBill = (bill: Bill) => {
    editBill({
      variables: { id: billId, bill },
      onCompleted: data => onEditBillCompleted(data),
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
    });
  };

  const { updateAccount, loading: editAccLoading } = useEditAccount();

  const onEditBillCompleted = (response: EditBillResponse) => {
    const {
      editBill: { bill, success }
    } = response;

    enqueueSnackbar(`${bill.name} bill updated`, { variant: 'success' });

    if (success && !selectedBill?.paid && bill?.paid) {
      const newBalance = bankBalance - (bill?.amount || 0);
      if (!isNaN(newBalance)) {
        updateAccount({ bankBalance: newBalance });
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
      onCompleted: () => enqueueSnackbar(`Bill deleted`, { variant: 'success' }),
      onError: handleGQLError
    });
  };

  if (editAccLoading || editBillLoading || delBillLoading) {
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
