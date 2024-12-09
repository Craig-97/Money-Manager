import { useMutation } from '@apollo/client';
import { useEditAccount } from './useEditAccount';
import { EDIT_BILL_MUTATION } from '~/graphql';
import { useSnackbar } from '~/state';
import { Bill, EditBillResponse } from '~/types';

interface EditSelectedBillProps {
  billId: string;
  bill: Bill;
  currentBankBalance: number;
  isPreviouslyPaid?: boolean;
}

export const useEditBill = (onSuccess?: () => void) => {
  const { enqueueSnackbar } = useSnackbar();
  const { updateAccount } = useEditAccount();

  const [editBill, { loading }] = useMutation(EDIT_BILL_MUTATION);

  const editSelectedBill = ({
    billId,
    bill,
    currentBankBalance,
    isPreviouslyPaid
  }: EditSelectedBillProps) => {
    editBill({
      variables: { id: billId, bill },
      onCompleted: (data: EditBillResponse) => {
        const {
          editBill: { bill, success }
        } = data;

        enqueueSnackbar(`${bill.name} bill updated`, { variant: 'success' });

        if (success && !isPreviouslyPaid && bill?.paid) {
          const newBalance = currentBankBalance - (bill?.amount || 0);
          if (!isNaN(newBalance)) {
            updateAccount({
              input: { bankBalance: newBalance }
            });
          }
        }

        onSuccess?.();
      },
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
    });
  };

  return { editSelectedBill, loading };
};
