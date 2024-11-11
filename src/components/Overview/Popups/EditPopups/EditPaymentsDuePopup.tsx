import { PaymentsDuePopup } from '../FormPopups';
import { useEditAccount, useEditPayment, useDeletePayment } from '~/hooks';
import { useAccountStore } from '~/state';
import { OneOffPayment } from '~/types';

interface EditPaymentsDuePopupProps {
  isOpen: boolean;
  close: () => void;
  selectedPayment: OneOffPayment;
}

export const EditPaymentsDuePopup = ({
  isOpen,
  close,
  selectedPayment
}: EditPaymentsDuePopupProps) => {
  const bankBalance = useAccountStore(s => s.account.bankBalance);
  const { id: paymentId, name, amount }: OneOffPayment = selectedPayment;

  const { editSelectedPayment, loading: editPayLoading } = useEditPayment(close);
  const { deleteSelectedPayment, loading: delPayLoading } = useDeletePayment(close);
  const { loading: editAccLoading } = useEditAccount();

  const handleEditPayment = (oneOffPayment: OneOffPayment) => {
    if (paymentId) {
      editSelectedPayment({ paymentId, payment: oneOffPayment });
    }
  };

  const handleDeletePayment = (paid: boolean) => {
    if (paymentId) {
      deleteSelectedPayment({
        paymentId,
        paid,
        currentBankBalance: bankBalance
      });
    }
  };

  return isOpen ? (
    <PaymentsDuePopup
      title="Edit Upcoming Payment"
      onSave={handleEditPayment}
      isOpen={isOpen}
      close={close}
      onDelete={handleDeletePayment}
      defaultName={name}
      defaultAmount={amount}
      loading={editAccLoading || editPayLoading || delPayLoading}
    />
  ) : null;
};
