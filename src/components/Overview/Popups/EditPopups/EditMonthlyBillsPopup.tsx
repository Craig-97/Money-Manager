import { MonthlyBillsPopup } from '../FormPopups';
import { useEditBill, useDeleteBill } from '~/hooks';
import { useAccountContext } from '~/state';
import { Bill } from '~/types';

interface EditMonthlyBillsPopupProps {
  isOpen: boolean;
  close: () => void;
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

  const { editSelectedBill, loading: editBillLoading } = useEditBill(close);
  const { deleteSelectedBill, loading: deleteBillLoading } = useDeleteBill(close);

  const handleEditBill = (bill: Bill) => {
    if (billId) {
      editSelectedBill({
        billId,
        bill,
        currentBankBalance: bankBalance,
        isPreviouslyPaid: selectedBill.paid
      });
    }
  };

  const handleDeleteBill = () => {
    if (billId) {
      deleteSelectedBill({
        billId,
        user
      });
    }
  };

  return isOpen ? (
    <MonthlyBillsPopup
      title="Edit Monthly Bill"
      onSave={handleEditBill}
      onDelete={handleDeleteBill}
      isOpen={isOpen}
      close={close}
      defaultName={name}
      defaultAmount={amount}
      defaultPaid={paid}
      loading={editBillLoading || deleteBillLoading}
    />
  ) : null;
};
