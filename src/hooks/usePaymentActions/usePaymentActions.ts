import { useMutation } from '@apollo/client/react';
import {
  BatchDeleteOneOffPaymentsDocument,
  BatchDeleteRecurringPaymentsDocument,
  MarkPaymentsPaidDocument,
  MarkPaymentsUnpaidDocument,
  UpdateRecurringPaymentDocument
} from '~/graphql/generated';
import { removeFromAccount } from '~/lib/apollo';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoney } from '~/lib/format';
import { Payment } from '~/lib/payments';
import { showToast } from '~/state/toast';

const idsOf = (payments: readonly Payment[], kind: Payment['kind']) =>
  payments.filter(payment => payment.kind === kind).map(payment => payment.id);

// "Netflix" for one payment, "3 payments" for more
const describe = (payments: readonly Payment[]) =>
  payments.length === 1 ? payments[0].name : `${payments.length} payments`;

/* "· £20.00 off your balance" for a single payment, so it's clear where the money went */
const balanceNote = (payments: readonly Payment[], paid: boolean) => {
  if (payments.length !== 1) return '';
  const [payment] = payments;
  const off = paid === (payment.type === 'EXPENSE');
  return ` · ${formatMoney(payment.amount)} ${off ? 'off' : 'added to'} your balance`;
};

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

/* Paying, skipping and deleting payments, with a toast to say it's done */
export const usePaymentActions = (accountId: string) => {
  const [markPaid] = useMutation(MarkPaymentsPaidDocument);
  const [markUnpaid] = useMutation(MarkPaymentsUnpaidDocument);
  const [updateRecurring] = useMutation(UpdateRecurringPaymentDocument);
  const [deleteRecurring] = useMutation(BatchDeleteRecurringPaymentsDocument);
  const [deleteOneOffs] = useMutation(BatchDeleteOneOffPaymentsDocument);

  /*
   * Marks payments paid, taking them off the bank balance as v1 did: recurring payments stay
   * paid until the next cycle, one-offs are done with and deleted. Marking a recurring payment
   * unpaid again puts its amount back.
   */
  const setPaid = async (payments: readonly Payment[], paid: boolean) => {
    if (!payments.length) return;
    try {
      if (paid) {
        const oneOffIds = idsOf(payments, 'oneOff');
        await markPaid({
          variables: {
            input: {
              accountId,
              recurringPaymentIds: idsOf(payments, 'recurring'),
              oneOffPaymentIds: oneOffIds
            }
          },
          // The returned account lists them without the deleted one-offs; drop the entities too
          update: cache => {
            for (const id of oneOffIds)
              cache.evict({ id: cache.identify({ __typename: 'OneOffPayment', id }) });
            cache.gc();
          }
        });
      } else {
        await markUnpaid({
          variables: { input: { accountId, recurringPaymentIds: idsOf(payments, 'recurring') } }
        });
      }
      showToast({
        message: `${describe(payments)} marked as ${paid ? 'paid' : 'unpaid'}${balanceNote(payments, paid)}`
      });
    } catch (error) {
      showError(error);
    }
  };

  /* Leaves a recurring payment out of this cycle; it comes back on its next date */
  const skip = async (payment: Payment) => {
    try {
      await updateRecurring({ variables: { id: payment.id, input: { status: 'SKIPPED' } } });
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
