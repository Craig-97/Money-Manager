import { useMutation } from '@apollo/client/react';
import { removeFromAccount } from '~/graphql/cache';
import {
  BatchDeleteOneOffPaymentsDocument,
  BatchDeleteRecurringPaymentsDocument,
  MarkPaymentsPaidDocument,
  MarkPaymentsUnpaidDocument,
  SkipRecurringPaymentsDocument
} from '~/graphql/generated';
import { toApiDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoney } from '~/lib/format';
import { formatShortDate, Payment, RecurringPayment, repeatsInCycle } from '~/lib/payments';
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
  const [skipRecurring] = useMutation(SkipRecurringPaymentsDocument);
  const [deleteRecurring] = useMutation(BatchDeleteRecurringPaymentsDocument);
  const [deleteOneOffs] = useMutation(BatchDeleteOneOffPaymentsDocument);

  /*
   * Marks payments paid, taking them off the bank balance as v1 did: a recurring payment has its
   * next date paid and moves on to the one after, and one-offs are done with and deleted.
   */
  const pay = async (payments: readonly Payment[]) => {
    if (!payments.length) return;
    const oneOffIds = idsOf(payments, 'oneOff');
    try {
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
      showToast({ message: `${describe(payments)} marked as paid${balanceNote(payments, true)}` });
    } catch (error) {
      showError(error);
    }
  };

  /* Undoes the latest pay or skip, bringing those dates back. A paid amount goes back on. */
  const undo = async (payment: RecurringPayment) => {
    const latest = payment.handled.at(-1);
    if (!latest) return;
    try {
      await markUnpaid({ variables: { input: { accountId, recurringPaymentIds: [payment.id] } } });
      showToast({
        message:
          latest.outcome === 'paid'
            ? `${payment.name} marked as unpaid${balanceNote([payment], false)}`
            : `${payment.name} is no longer skipped`
      });
    } catch (error) {
      showError(error);
    }
  };

  /*
   * Skips a recurring payment's next date, or every date before `until` (the next payday) to skip
   * the rest of the cycle. The balance doesn't change.
   */
  const skip = async (payment: RecurringPayment, until?: Date) => {
    try {
      await skipRecurring({
        variables: {
          input: {
            accountId,
            recurringPaymentIds: [payment.id],
            until: until ? toApiDate(until) : undefined
          }
        }
      });
      const skipped = until
        ? 'for the rest of this cycle'
        : repeatsInCycle(payment) && payment.dueDate
          ? `for ${formatShortDate(payment.dueDate)}`
          : 'this cycle';
      showToast({ message: `${payment.name} skipped ${skipped}` });
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

  return { pay, undo, skip, remove };
};

export type PaymentActions = ReturnType<typeof usePaymentActions>;
