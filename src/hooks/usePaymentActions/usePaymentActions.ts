import { useMutation } from '@apollo/client/react';
import {
  BatchDeleteOneOffPaymentsDocument,
  BatchDeleteRecurringPaymentsDocument,
  BatchUpdateOneOffPaymentsDocument,
  BatchUpdateRecurringPaymentsDocument,
  UpdateRecurringPaymentDocument
} from '~/graphql/generated';
import { removeFromAccount } from '~/lib/apollo';
import { getApiErrorMessage } from '~/lib/errors';
import { Payment } from '~/lib/payments';
import { showToast } from '~/state/toast';

const idsOf = (payments: readonly Payment[], kind: Payment['kind']) =>
  payments.filter(payment => payment.kind === kind).map(payment => payment.id);

// "Netflix" for one payment, "3 payments" for more
const describe = (payments: readonly Payment[]) =>
  payments.length === 1 ? payments[0].name : `${payments.length} payments`;

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

/* Marking payments paid, skipping and deleting them, with a toast to say it's done */
export const usePaymentActions = (accountId: string) => {
  const [updateRecurring] = useMutation(BatchUpdateRecurringPaymentsDocument);
  const [updateOneOffs] = useMutation(BatchUpdateOneOffPaymentsDocument);
  const [updateOneRecurring] = useMutation(UpdateRecurringPaymentDocument);
  const [deleteRecurring] = useMutation(BatchDeleteRecurringPaymentsDocument);
  const [deleteOneOffs] = useMutation(BatchDeleteOneOffPaymentsDocument);

  /* Marks payments paid, or unpaid again. Paid recurring payments stay paid until the next cycle. */
  const setPaid = async (payments: readonly Payment[], paid: boolean) => {
    if (!payments.length) return;
    const recurring = idsOf(payments, 'recurring');
    const oneOffs = idsOf(payments, 'oneOff');
    try {
      await Promise.all([
        recurring.length
          ? updateRecurring({
              variables: {
                input: recurring.map(id => ({ id, status: paid ? 'PAID' : 'UNPAID' }))
              }
            })
          : null,
        oneOffs.length ? updateOneOffs({ variables: { ids: oneOffs, paid } }) : null
      ]);
      showToast({ message: `${describe(payments)} marked as ${paid ? 'paid' : 'unpaid'}` });
    } catch (error) {
      showError(error);
    }
  };

  /* Leaves a recurring payment out of this cycle; it comes back on its next date */
  const skip = async (payment: Payment) => {
    try {
      await updateOneRecurring({ variables: { id: payment.id, input: { status: 'SKIPPED' } } });
      showToast({ message: `${payment.name} skipped this cycle` });
    } catch (error) {
      showError(error);
    }
  };

  const remove = async (payments: readonly Payment[]) => {
    if (!payments.length) return;
    const recurring = idsOf(payments, 'recurring');
    const oneOffs = idsOf(payments, 'oneOff');
    try {
      await Promise.all([
        recurring.length
          ? deleteRecurring({
              variables: { ids: recurring },
              update: cache => removeFromAccount(cache, accountId, 'recurringPayments', recurring)
            })
          : null,
        oneOffs.length
          ? deleteOneOffs({
              variables: { ids: oneOffs },
              update: cache => removeFromAccount(cache, accountId, 'oneOffPayments', oneOffs)
            })
          : null
      ]);
      showToast({ message: `Deleted ${describe(payments)}` });
    } catch (error) {
      showError(error);
    }
  };

  return { setPaid, skip, remove };
};

export type PaymentActions = ReturnType<typeof usePaymentActions>;
