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
import { MonthlyBillsPopup } from '../FormPopups';
import { useErrorHandler } from '~/hooks';

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
  const handleGQLError = useErrorHandler();

  const [editBill, { loading: editBillLoading }] = useMutation(EDIT_BILL_MUTATION);

  const editSelectedBill = (bill: Bill) => {
    editBill({
      variables: { id: billId, bill },
      onCompleted: data => onEditBillCompleted(data),
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
    });
  };

  const [editAccount, { loading: editAccLoading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  // TODO - Add type for response
  const onEditBillCompleted = (response: any) => {
    const {
      editBill: { bill, success }
    } = response;

    enqueueSnackbar(`${bill.name} updated`, { variant: 'success' });

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
          onError: handleGQLError
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
